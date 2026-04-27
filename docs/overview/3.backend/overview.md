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
- migration 実行は `MigrationRunner Lambda`（`OpsStack`）を invoke して実行する
- migration/seed SQL は `migrate` 実行時に zip 化して S3 artifact へ upload し、Lambda は固定の bucket/key（環境変数）から取得する
- `OpsStack` の `MigrationArtifactBucket` は `RemovalPolicy.DESTROY` + `autoDeleteObjects=true` で destroy 時に残さない
- migration 適用は `drizzle-orm` 標準 migrator ではなく、自前 Runner で SQL をファイル順に適用する
- migration 履歴は `public.pf_migration_files`（`MIGRATIONS_SCHEMA` / `MIGRATIONS_TABLE` で変更可）で管理する
- seed は SQL ファイルをファイル順で実行し、1ファイル単位トランザクションで適用する
- DSQL 制約として `SERIAL` は非対応のため、連番カラムは `IDENTITY` 前提で設計する
- DSQL 制約として「同一 transaction 内の DDL + DML は不可」のため、migration SQL 実行と履歴INSERTは分離して実行する
- 検証導線として、seed 済みデータを GraphQL `seedItems` で取得しフロント表示で確認する

## GraphQL 命名ルール（推奨）

- Mutation 名は `動詞 + 対象 + 条件` を推奨する
  - 例: `addRandomMedicalStaffByInstitution`, `clearMedicalStaffsByInstitution`
- 本ルールは絶対ではないが、可読性・検索性のため backend 仕様として優先適用する
- 例外を採用する場合は、命名意図を該当ドキュメントまたは PR 説明に残す

## GraphQL Context 方針

- 環境変数は resolver で直接参照しない
- 環境変数の読み取りは `createGraphqlContext` に集約し、resolver は `context` からのみ参照する
- 設定値の取得責務（env 解決）と業務処理責務（resolver 実装）を分離する
- テスト時は `context` を差し替えて挙動確認できる形を維持する

### 現在の Context 値

- `dbClient`
  - 目的: DSQL へのクエリ実行入口
  - 用途: repository/use case 呼び出し時の DB アクセス
- `s3Client`
  - 目的: S3 署名 URL 生成・オブジェクト操作の SDK クライアント
  - 用途: `GetObject` / `PutObject` の presign 生成
- `imageBucket`
  - 目的: 画像保管先 S3 バケット名
  - 用途: presigned URL の対象 bucket 指定
- `imagePrefix`
  - 目的: 画像オブジェクトキーのプレフィックス（現行は `image/`）
  - 用途: 画像キー生成時の保存先制約
- `presignedUrlExpiresSeconds`
  - 目的: 署名 URL 有効期限の統一管理
  - 用途: PUT/GET 署名 URL の `expiresIn` 設定

## 決定ログ

- 2026-04-26: Drizzle + DSQL 移行の初期スコープとして、migration/seed/表示確認（`seedItems`）までを採用
- 2026-04-26: migration 自動化方式は `MigrationRunner Lambda` の invoke（deploy 後）を採用
- 2026-04-26: DSQL 互換性制約（`serial` 非対応、DDL + DML 同一 transaction 不可）に合わせ、自前 migration Runner 方式を採用
- 2026-04-26: migration SQL 配布は Lambda 同梱ではなく、`migrate` 実行時の `S3 upload -> invoke` 方式へ移行
- 2026-04-26: 任意実行防止のため、artifact の取得先は payload 指定ではなく Lambda 環境変数で固定
- 2026-04-27: GraphQL Mutation 命名は `動詞 + 対象 + 条件` を推奨ルールとして明記（絶対ルールではない）
- 2026-04-27: GraphQL の環境変数参照は `createGraphqlContext` に集約し、resolver では `context` 経由のみで扱う方針を追加

## 関連 plan

- `./plan/001-drizzle-dsql-migration.md`
- `./plan/002-migration-runner-lambda-design.md`
- `./plan/003-migration-runner-s3-artifact-design.md`
