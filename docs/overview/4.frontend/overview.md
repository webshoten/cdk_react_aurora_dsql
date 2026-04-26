# 4. フロントエンド

## 対象

- `packages/web`
- React + Vite
- `config.js` による runtime 設定

## 現状

- API URL は build 時埋め込みではなく `config.js` で注入
- 配信は CloudFront / S3 前提
- GraphQL `hello` を表示

## 決定ログ

- YYYY-MM-DD: (ここに決定事項を追記)
