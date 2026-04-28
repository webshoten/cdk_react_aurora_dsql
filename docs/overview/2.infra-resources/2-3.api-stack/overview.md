# 2-3. ApiStack

## 対象

- `ApiStack`
- HTTP API + GraphQL Lambda

## 責務

- stage 単位の API 提供レイヤーを管理する
- `/graphql` エンドポイントを提供する

## 管理リソース

- `AWS::ApiGatewayV2::Api`（HTTP API）
- `AWS::Lambda::Function`（GraphQL）
- `AWS::Logs::LogGroup`（GraphQL ログ）

## 決定ログ

- 2026-04-28: 決定ログのプレースホルダを廃止し、日付付き追記方式へ統一
