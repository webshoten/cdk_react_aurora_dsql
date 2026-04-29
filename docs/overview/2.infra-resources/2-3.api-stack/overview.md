# 2-3. ApiStack

## 対象

- `ApiStack`
- HTTP API + GraphQL Lambda

## 責務

- stage 単位の API 提供レイヤーを管理する
- `/graphql` エンドポイントを提供する
- 認証基盤は `AuthStack` の出力を参照して適用する

## 管理リソース

- `AWS::ApiGatewayV2::Api`（HTTP API）
- `AWS::Lambda::Function`（GraphQL）
- `AWS::Logs::LogGroup`（GraphQL ログ）

## 依存関係

- `DbStack`: GraphQL Lambda の DB 接続情報を参照する
- `StorageStack`: 画像ストレージ参照設定を受け取る
- `AuthStack`: Authorizer / UserPool 連携に必要な認証設定値を参照する

## 決定ログ

- 2026-04-28: 決定ログのプレースホルダを廃止し、日付付き追記方式へ統一
- 2026-04-28: 認証基盤分離に合わせ、`ApiStack` は `AuthStack` の認証設定値を参照する方針を追加
