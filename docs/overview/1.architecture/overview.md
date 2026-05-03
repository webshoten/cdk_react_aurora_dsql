# 1. 全体アーキテクチャ

## 対象

- AWS CDK 構成全体
- stack 間の責務分離

## 現状

- IaC: AWS CDK + TypeScript
- stack は `shared` 層と `app` 層で分ける
- `shared` 層:
  - `SharedStack`
  - 責務: システム全体で共有する基盤情報・共通前提を管理する（土台レイヤー）
  - 管理リソース:
    - `AWS::SSM::Parameter`（shared contract / shared env）
- `app` 層:
  - `DbStack`
    - 管理リソース:
      - `AWS::DSQL::Cluster`（Aurora DSQL）
  - `ApiStack`
    - 管理リソース:
      - `AWS::ApiGatewayV2::Api`（HTTP API）
      - `AWS::Lambda::Function`（GraphQL）
      - `AWS::Logs::LogGroup`（GraphQL ログ）
  - `AuthStack`
    - 管理リソース:
      - `AWS::Cognito::UserPool`
      - `AWS::Cognito::UserPoolClient`
      - `AWS::Cognito::IdentityPool`
      - `AWS::Lambda::Function`（UserPool Trigger）
  - `OpsStack`
    - 管理リソース:
      - `AWS::S3::Bucket`（migration SQL zip 保管）
      - `AWS::Lambda::Function`（MigrationRunner）
      - `AWS::Logs::LogGroup`（MigrationRunner ログ）
  - `StorageStack`
    - 管理リソース:
      - `AWS::S3::Bucket`（image 保存）
  - `WebStack`
    - 管理リソース:
      - `AWS::S3::Bucket`（静的配信）
      - `AWS::CloudFront::Distribution`
      - `Custom::CDKBucketDeployment`（Web 配備）
  - 責務: stage 単位でアプリケーション機能を構成し、変更・検証・破棄を独立して回せるようにする（実行レイヤー）
- `SharedStack` が SSM Parameter Store に最小 contract を出力し、app stack が参照する
- SSM Parameter の命名責務は分離し、共有基盤値は `/pf/shared/<sharedEnv>/...`、CI/CD 入力値は `/pf/cd/<sharedEnv>/env/...` を利用する

## stack 間の責務分離（簡潔版）

- `SharedStack` は共通前提を提供し、`app` 層の stack から参照される
- `DbStack` はデータ基盤を担当し、`ApiStack` / `OpsStack` が参照する
- `ApiStack` は API 提供を担当し、`WebStack` が endpoint を参照する
- `AuthStack` は認証基盤を担当し、`ApiStack` / `WebStack` が認証設定値を参照する
- `StorageStack` は画像ストレージを担当し、`ApiStack` が参照する
- `OpsStack` は migration 実行基盤を担当し、運用 CLI が参照する
- `WebStack` は配信レイヤーを担当し、他 stack へ依存を持たない終端とする

## 実装レイヤーの構成方針

- フロントエンド（`packages/web`）は vertical slice（機能軸）で構成する
- バックエンド（`packages/functions`）は horizontal（レイヤー軸）で構成する
- バックエンドのレイヤー軸は `handlers / graphql / services / shared` を採用する

## 決定ログ

- 2026-04-27: app stack 構成に `StorageStack` を追加（画像ストレージ用途）
- 2026-04-27: app stack 構成に `OpsStack` を明記（migration 運用用途）
- 2026-04-28: app stack 構成に `AuthStack` を追加（認証基盤分離）
- 2026-04-30: 実装構成方針として、フロントエンドは vertical slice、バックエンドは horizontal（レイヤー軸）を採用
- 2026-05-02: SSM Parameter 命名を shared 用 (`/pf/shared/<sharedEnv>/...`) と cd 用 (`/pf/cd/<sharedEnv>/env/...`) に分離
