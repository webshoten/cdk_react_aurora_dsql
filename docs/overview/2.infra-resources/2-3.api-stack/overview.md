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

- YYYY-MM-DD: (ここに決定事項を追記)
