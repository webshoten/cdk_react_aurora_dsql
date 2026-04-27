# MigrationRunner S3 SQL Zip 設計（初版）

## この文書の位置づけ

- `MigrationRunner` の SQL 配布方式を Lambda 同梱から S3 SQL zip へ切り替える設計
- 本文書は「開発/検証フロー」の設計を対象とする
- 本番運用ルール（承認フローや実行責務分離）は本設計のスコープ外

## 背景

- 現状は migration/seed SQL を Lambda パッケージに同梱している
- そのため SQL 変更の反映には `cdk deploy` が必要
- ローカル検証速度を上げるため、`S3 upload -> invoke` で実行可能にする

## 目的

- SQL 配布を Lambda デプロイから分離する
- `migrate` 実行時に任意の SQL セットを適用できるようにする
- stack destroy 時に S3 上の SQL ファイルを残さない

## スコープ

- 対象:
  - `OpsStack` に migration SQL zip 用 S3 バケットを追加
  - `MigrationRunnerFunction` が S3 から SQL zip を取得して実行
  - `scripts/migrate.ts` が `zip -> upload -> invoke` を一括実行
- 非対象:
  - migration SQL 生成方式（`drizzle-kit generate`）
  - migration 履歴テーブル仕様（`pf_migration_files`）
  - 本番運用ポリシーの最終決定

## 採用方針（確定）

- S3 方式へ一本化する
- SQL は zip 1ファイルで扱う
- key は固定運用（上書き）を許容する
- SQL zip の bucket/key は Lambda 環境変数で固定する
- YAGNI として以下は初版で実装しない
  - ハッシュ検証
  - 一意 key 強制
  - 監査専用の追加仕組み

## アーキテクチャ

1. `scripts/migrate.ts` が `packages/core/src/db/migrations` と `packages/core/src/db/seeds` を zip 化
2. zip を SQL zip 保管バケット（識別子名: `MigrationArtifactBucket`）の固定 key にアップロード
3. `MigrationRunnerFunction` は環境変数で固定した bucket/key を参照して実行する
4. Lambda が S3 から zip を取得し、`/tmp` へ展開して migration/seed を実行

## インフラ設計

## A. S3 バケット（確定）

- `OpsStack` に SQL zip 保管バケット（識別子名: `MigrationArtifactBucket`）を追加
- 設定:
  - `removalPolicy: DESTROY`
  - `autoDeleteObjects: true`
  - `blockPublicAccess: BLOCK_ALL`
  - `enforceSSL: true`
  - `versioned: false`

補足:

- 固定 key 上書き運用のため、通常時は残骸が増えない
- `destroy` 時は bucket と中身を削除する

## B. IAM（確定）

- `MigrationRunnerFunction` 実行ロール:
  - `s3:GetObject`（SQL zip 取得）
- `scripts/migrate.ts` 実行主体（ローカル/CI）:
  - `s3:PutObject`
  - `lambda:InvokeFunction`

## アプリ設計

## C. invoke payload

```json
{
  "stage": "dev",
  "sharedEnv": "dev",
  "migration": { "enabled": true },
  "seed": { "enabled": true },
  "requestId": "manual-<timestamp>"
}
```

補足:

- payload で SQL zip の参照先は受け取らない
- `ARTIFACT_S3_BUCKET` / `ARTIFACT_S3_KEY` を Lambda 環境変数で固定する

## D. Lambda 実行フロー（確定）

1. 環境変数 `ARTIFACT_S3_BUCKET` / `ARTIFACT_S3_KEY` を取得
2. S3 object を `/tmp/migration-artifact.zip`（実装上の一時ファイル名）として取得
3. `/tmp/migration-artifact/`（実装上の一時ディレクトリ名）に展開
4. `runDsqlMigrationAndSeed` を以下で実行
   - `migrationsFolder=/tmp/migration-artifact/migrations`
   - `seedsFolder=/tmp/migration-artifact/seeds`
5. 実行結果を返却

補足:

- 初版では `DeleteObject` は行わない（固定 key 上書き運用のため）

## E. CLI 設計（`scripts/migrate.ts`）

- 既存 `migrate` を拡張し、以下を自動実行する
  1. zip 作成（`migrations/` + `seeds/`）
  2. `aws s3 cp` で固定 key へ upload
  3. `aws lambda invoke` 実行
- 既存オプション（`--migration-only`, `--seed-only`）は継続

## エラー設計

- upload 失敗:
  - invoke しないで即失敗終了
- SQL zip 取得/展開失敗:
  - `ok=false` で返却
  - `failedStep` は実装上の識別子値として `artifact_download` または `artifact_extract` を返す
- migration/seed 失敗:
  - 既存仕様どおり `ok=false` で返却

## 実装タスク分解

1. `@pf/infra`
   - `OpsStack` に SQL zip 保管バケット（識別子名: `MigrationArtifactBucket`）を追加
   - バケット名/既定keyを `MigrationRunnerFunction` の環境変数へ渡す
2. `@pf/functions`
   - migration handler から payload の SQL zip 参照先入力を削除
   - S3 取得と zip 展開処理を追加
3. `scripts/migrate.ts`
   - zip 作成と upload 処理を追加
   - invoke payload から SQL zip 参照先を除外
4. docs
   - ローカル/CI 実行手順（upload -> invoke）を追記

## 要確認（未決定）

- 固定 key 名（例: `current/migration-seed.zip`）の最終命名
- CI 用 IAM 権限境界（どの stage/sharedEnv まで許可するか）

## 決定ログ

- 2026-04-26: `S3 upload -> invoke` 方式で設計を開始
- 2026-04-26: S3 方式一本化を採用（Lambda 同梱方式は廃止方向）
- 2026-04-26: 初版は YAGNI 方針とし、ハッシュ検証・一意key強制・監査拡張は対象外
- 2026-04-26: 本番運用ポリシーは本設計のスコープ外とした
- 2026-04-26: `cdk deploy` 時の baseline SQL zip upload は採用しない（SQL zip は `migrate` 実行時に upload）
- 2026-04-26: 任意実行防止のため、SQL zip の bucket/key は payload 指定ではなく環境変数固定を採用
