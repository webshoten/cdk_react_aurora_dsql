# 3. バックエンド

## 対象

- `packages/functions`
- `packages/core`
- GraphQL Yoga / Pothos
- DB クライアント連携

## 現状

- GraphQL エンドポイント: `/graphql`
- query `seedItems` で seed データを取得
- GraphQL context から `dbClient` を注入
- REST `/hello` は廃止済み

## 今回の仕様概要（Drizzle + DSQL）

- DB クエリ層は `@pf/core` で Drizzle を利用する
- migration は `schema.ts` から `drizzle-kit generate` で SQL 生成し、生成SQLを Git 管理する
- migration 実行は `MigrationRunner Lambda`（`OpsStack`）を deploy 後に invoke する
- migration 適用は `drizzle-orm` 標準 migrator ではなく、自前 Runner で SQL をファイル順に適用する
- migration 履歴は `public.pf_migration_files`（`MIGRATIONS_SCHEMA` / `MIGRATIONS_TABLE` で変更可）で管理する
- seed は SQL ファイルをファイル順で実行し、1ファイル単位トランザクションで適用する
- DSQL 制約として `SERIAL` は非対応のため、連番カラムは `IDENTITY` 前提で設計する
- DSQL 制約として「同一 transaction 内の DDL + DML は不可」のため、migration SQL 実行と履歴INSERTは分離して実行する
- 検証導線として、seed 済みデータを GraphQL `seedItems` で取得しフロント表示で確認する

## 決定ログ

- 2026-04-26: Drizzle + DSQL 移行の初期スコープとして、migration/seed/表示確認（`seedItems`）までを採用
- 2026-04-26: migration 自動化方式は `MigrationRunner Lambda` の invoke（deploy 後）を採用
- 2026-04-26: DSQL 互換性制約（`serial` 非対応、DDL + DML 同一 transaction 不可）に合わせ、自前 migration Runner 方式を採用

## 関連 plan

- `./plan/001-drizzle-dsql-migration.md`
- `./plan/002-migration-runner-lambda-design.md`
- `./plan/003-migration-runner-s3-artifact-design.md`
