# Drizzle + DSQL 移行計画（初版）

## テーマ

- `@pf/core` の DB ミドル層を `pg raw client` から `drizzle` ベースへ移行する
- DSQL への migration 反映方式を定義する
- migration 実行時の seed 投入と、seed データの表示確認までを初期スコープに含める

## 背景

- 現在は `createDsqlClient()` 経由で `pg` の `query()` を直接実行している
- クエリが増えると型安全性と差分管理が弱くなる
- `../rehacul` では `drizzle + migration SQL 管理` が実運用されているため、要点を参考にしたい
- ただし `rehacul` は MySQL 前提部分があるため、そのまま移植はしない

## 参考にした既存実装（抜粋）

- `cdk_pf` 現状
  - `packages/core/src/db/client.ts`
  - `packages/core/src/db/types.ts`
  - `packages/core/src/select1.ts`
- `rehacul` 参考
  - `../rehacul/packages/core/src/drizzle.ts`
  - `../rehacul/packages/core/drizzle.config.ts`
  - `../rehacul/packages/core/migrations/migration.ts`
  - `../rehacul/packages/core/migrations/meta/_journal.json`

## 方針（採用案）

- Drizzle の採用はするが、初期段階は「薄く」導入する
- `rehacul` のような大規模 migration 資産は持ち込まない
- 最終的には既存テーブル概念の移行を目指すが、初期検証は 1 テーブル（または簡易な同等テーブル）から開始する
- migration は自動化前提とし、`Lambda invoke` 方式を採用する
- ローカル実行は別運用として手動実行を許可する

## 実装方針

## 1) DB ミドル層の Drizzle 化

- `packages/core` に Drizzle 用エントリを新設する
- DSQL 認証トークン生成は既存 `DsqlSigner` を継続利用する
- `dbClient(fn)` 形式は段階移行のため当面残す
- 新規コードは Drizzle API を優先し、既存 raw SQL は段階的に置換する

想定追加ファイル（案）:

- `packages/core/src/db/drizzle.ts`
- `packages/core/src/db/schema.ts`
- `packages/core/src/db/migrations/*`
- `packages/core/drizzle.config.ts`

## 2) migration 反映方式（DSQL）

- 方式は `schema.ts` をソースに `drizzle-kit generate` で SQL を生成し、生成SQLを Git 管理する
- `MigrationRunner Lambda` は生成済み SQL をファイル順に直接適用する
- 自動反映は `MigrationRunner Lambda` の invoke で行う
- 冪等性は自前の migration 履歴テーブル（`pf_migration_files`）で実行済み判定する
- migration 履歴テーブルの schema は環境変数で設定可能にし、現時点では `public` を使用する
- seed も `MigrationRunner Lambda` で実行する
- seed は SQL として管理し、再実行しても破綻しない冪等設計にする
- ローカル検証用には別途手動実行コマンドを用意する

配置（確定）:

- migration SQL: `packages/core/src/db/migrations`
- seed SQL: `packages/core/src/db/seeds`

採用理由（Lambda invoke）:

- `Custom Resource` は削除時（Delete ハンドリング/応答返却失敗）で `DELETE_FAILED` になりやすく、運用リスクが高い
- migration 実行を CloudFormation ライフサイクルから分離できる
- 失敗時に「DB migration の失敗」と「スタック更新失敗」を切り分けやすい

初期運用イメージ:

1. `schema.ts` 更新
2. `drizzle-kit generate` で migration SQL を生成
3. 生成された migration SQL を Git 管理
4. seed SQL を更新（必要時）
5. アプリ deploy
6. CI などから `MigrationRunner Lambda` を invoke して migration + seed を適用（deploy 後）
7. seed データ取得用 query を実装
8. フロントエンドで seed データを表示して確認

## 採用しない方針（現時点）

- `rehacul` 同等の seed/migration まで一気に導入
- CloudFormation `Custom Resource` に migration を直接ぶら下げる
- 既存 query を一括置換

## 判断理由

- 一括移行は影響範囲が広く、`cdk_pf` の段階移行方針と相性が悪い
- 先に migration 管理を確立し、次にクエリ置換へ進むとリスクを分割できる
- DSQL 連携の未知点（接続方式/権限/実行時間制約）は PoC で先に潰すべき

## 検証項目（着手時に先に確認）

- Drizzle が DSQL 接続（`pg` ドライバ経由）で問題なく動くか
- migrator 実行時に DSQL 側で必要な権限を満たしているか
- migration 実行場所をどこに置くか
  - ローカル CLI 実行
  - CI ジョブ
  - CI からの MigrationRunner Lambda invoke
- migration 失敗時のリカバリ手順

## 段階計画

- Phase 1: `MigrationRunner Lambda` で migration + seed を自動適用する最小構成を作る
- Phase 2: seed データ取得用 query を実装し、フロントエンドに表示して疎通確認する
- Phase 3: 対象テーブルを段階拡張し、DBアクセスを順次 Drizzle 化
- Phase 4: deploy パイプライン連携を拡張（必要時）

## `overview` へ反映する確定候補

- バックエンドの DB 層は Drizzle を標準採用（段階移行）
- migration は `schema.ts` から SQL 生成し、生成SQLを Git 管理 + `Lambda invoke` 自動適用を採用
- seed は SQL で管理し、`MigrationRunner Lambda` で migration と同時適用する
- ローカル検証用の手動実行フローは別で持つ

## 決定ログ

- 2026-04-26: migration 自動化方式は `Lambda invoke` を採用。`Custom Resource` は削除時失敗リスクのため不採用。
- 2026-04-26: `MigrationRunnerFunction` は `OpsStack` に配置し、invoke は deploy 後に実行する。
- 2026-04-26: migration は `schema.ts` から `drizzle-kit generate` で生成した SQL を Git 管理する方式を採用。
- 2026-04-26: migration/seed の配置は `packages/core/src/db/migrations` / `packages/core/src/db/seeds` に確定。
- 2026-04-26: migration 管理スキーマは `MIGRATIONS_SCHEMA` で設定可能にし、現時点は `public` を採用（将来の schema 分離に備える）。
- 2026-04-26: DSQL で `serial` 非対応エラーが発生するため、`drizzle-orm` migrator は使用せず、自前 Runner + `pf_migration_files` で実行管理する。

## 関連 plan

- 詳細設計（要議論）: `./002-migration-runner-lambda-design.md`
