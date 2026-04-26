# 3. バックエンド

## 対象

- `packages/functions`
- `packages/core`
- GraphQL Yoga / Pothos
- DB クライアント連携

## 現状

- GraphQL エンドポイント: `/graphql`
- query `hello` で `SELECT 1` を実行
- GraphQL context から `dbClient` を注入
- REST `/hello` は廃止済み

## 決定ログ

- YYYY-MM-DD: (ここに決定事項を追記)
