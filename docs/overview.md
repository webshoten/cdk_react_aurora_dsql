# Overview

- 進行状況: [Resume](./resume.md)

## IaC

- AWS CDK
- TypeScript
- stack 構成
  - `SharedStack`
  - `DbStack`
  - `ApiStack`
  - `WebStack`

## インフラリソース

- Aurora DSQL
  - stage ごとに作成
  - deletion protection は無効
  - app stack 配下で管理
- AWS Lambda
  - Node.js 24
  - VPC には参加しない
  - GraphQL handler を実行
- API Gateway
  - HTTP API
  - `/graphql` を公開
- Amazon S3
  - フロントエンドの静的配信元
  - destroy 時は自動削除
- Amazon CloudFront
  - S3 を origin にした静的配信
  - `config.js` を含めて配布
- AWS Systems Manager Parameter Store
  - shared contract の受け渡しに利用
  - app stack は shared の値を読む

## バックエンド

- 言語
  - TypeScript
- フレームワーク
  - GraphQL Yoga
  - Pothos
- パッケージ構成
  - `packages/functions`
    - Lambda entry point
    - GraphQL schema / context
  - `packages/core`
    - アプリケーションロジック
    - DB クライアント共通処理

## フロントエンド

- 言語
  - TypeScript
- フレームワーク
  - React
  - Vite
- 設定
  - API URL は build 時に埋め込まず `config.js` で渡す
  - CloudFront / S3 配信を前提にする

## CI/CD

- 現状
  - 未整備
- 想定
  - 将来的に追加する

## 開発環境

- パッケージマネージャ
  - `pnpm`
- stage
  - 未指定時は `whoami`
- sharedEnv
  - 必須
- ローカル確認
  - GraphQL endpoint
  - web build

## デプロイ方針

- deploy 順序
  - `shared`
  - `app`
- destroy 順序
  - `app`
  - `shared`

## AI

- 利用前提
  - `Codex` / `Claude`
- MCP
  - 現状は `awslabs-aws-iac-mcp-server` を利用
- Skill
  - 現状は `react-best-practices` を導入済み

## 未決事項

- migration 方式
- ORM 採用有無
- CI/CD
- DSQL 運用詳細

## 詳細設計フォルダ

- [1. 全体アーキテクチャ](./overview/1.architecture/overview.md)
- [2. インフラリソース](./overview/2.infra-resources/overview.md)
- [3. バックエンド](./overview/3.backend/overview.md)
- [4. フロントエンド](./overview/4.frontend/overview.md)
- [5. CI/CD](./overview/5.ci-cd/overview.md)
- [6. デプロイ運用](./overview/6.deployment-operations/overview.md)
- [7. 未決事項](./overview/7.open-issues/overview.md)
- [8. コーディングルール](./overview/8.coding-rules/overview.md)
- [9. AI](./overview/9.ai/overview.md)
- [10. ローカル開発](./overview/10.local-dev/overview.md)

## 更新フロー

- まず各章フォルダの `plan/` に設計メモを作成する
- 設計が確定した内容のみ各章の `overview.md` に反映する
- `overview.md` は確定情報、`plan/` は検討中メモとして扱う
