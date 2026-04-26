# MigrationRunner Lambda 設計（要議論）

## この文書の扱い

- ここは検討中の設計メモ
- `確定` ラベルがある項目だけ決定済み
- `要確認` ラベルは未確定

## 前提（確定）

- migration 自動化方式は `Lambda invoke`
- `Custom Resource` は不採用
- seed は SQL で管理し、冪等（UPSERT 系）で実装する
- 初期は 1 テーブル（または簡易同等テーブル）で検証する

## 目的

- CI から 1 回の invoke で `migration + seed` を安全に実行する
- 再実行しても破綻しない（冪等）
- 失敗原因を切り分けやすくする

## 構成案

## A. 配置

- 案1: 専用の補助処理 stack を新設し、`MigrationRunnerFunction` を配置する
- 案2: `ApiStack` 配下に `MigrationRunnerFunction` を追加
- 案3: `DbStack` 配下に `MigrationRunnerFunction` を追加

確定:

- 専用補助処理 stack を採用する
- stack 名は `OpsStack`

## B. 実行トリガー

- `GitHub Actions` などの CI から `aws lambda invoke`
- 実行順は `migration -> seed`
- invoke タイミングは deploy 後
- invoke 失敗はログで把握し、deploy の成功/失敗判定には連動させない
- 方針: deploy 後 migration で発生しうる一時的なスキーマ不整合は現時点では許容する（将来対応）

## Lambda 入出力設計

## C. 入力 payload（案）

```json
{
  "stage": "dev",
  "sharedEnv": "dev",
  "migration": {
    "enabled": true
  },
  "seed": {
    "enabled": true,
    "target": "baseline"
  },
  "requestId": "ci-<run-id>"
}
```

補足:

- `dryRun` は初期リリースでは採用しない
- `requestId` はログ相関用

## D. 出力 payload（案）

```json
{
  "ok": true,
  "stage": "dev",
  "migration": {
    "appliedCount": 1
  },
  "seed": {
    "appliedCount": 3
  },
  "durationMs": 1234
}
```

失敗時:

```json
{
  "ok": false,
  "stage": "dev",
  "failedStep": "seed",
  "errorCode": "SQL_ERROR",
  "message": "..."
}
```

## 実行シーケンス（案）

1. 環境変数検証（DSQL endpoint/region/user/clusterArn など）
2. DSQL auth token 生成（既存 `DsqlSigner`）
3. `drizzle` 接続初期化
4. migration 実行（drizzle migrator）
5. seed SQL 実行（順序固定）
6. 結果サマリを返却

## seed SQL のルール（確定 + 案）

- 確定: seed は SQL ファイル管理、冪等（UPSERT）
- 案:
  - `packages/core/src/db/seeds/001_baseline.sql`
  - 参照マスタ系は `INSERT ... ON CONFLICT (...) DO UPDATE` を基本にする
  - 削除系（`DELETE`）は原則禁止。必要時は明示レビュー対象にする
  - seed 実行は「ファイル単位トランザクション」を基本にする

## エラー時挙動（案）

- migration 失敗: seed は実行しない、失敗をログ出力して `ok=false` を返却
- seed 失敗: 失敗をログ出力して `ok=false` を返却
- Lambda タイムアウト: タイムアウトをログで把握し、運用で再実行する

## IAM / セキュリティ（案）

- Lambda 実行ロールに `dsql:DbConnectAdmin` を付与（対象: clusterArn）
- CloudWatch Logs への出力
- invoke 権限は CI ロールに限定

## 実装タスク分解（案）

1. `@pf/core` に drizzle 接続・schema・migration/seed 実行ユーティリティ追加
2. `@pf/functions` に `migration` handler 追加
3. `@pf/infra` に `MigrationRunnerFunction` と IAM 追加
4. CI に invoke ステップ追加（失敗はログ記録し、deploy 判定とは分離）
5. seed 取得 query とフロント表示実装

## TODO

- migration invoke 失敗時のアラート通知（Slack / ChatOps / メール）を追加する
- deploy 後に migration 未適用を検知する運用チェックを追加する
- deploy 後 migration に伴う一時的スキーマ不整合の低減策（expand/contract, feature flag など）を将来検討する

## 要確認（この文書で未確定）

1. seed SQL の配置場所（`packages/core/src/db/seeds` で確定してよいか）

## 決定ログ

- 2026-04-26: `MigrationRunnerFunction` の配置は `OpsStack` を採用
- 2026-04-26: invoke は deploy 後。失敗はログ把握のみ（deploy 判定には連動しない）
