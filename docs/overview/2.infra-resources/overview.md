# 2. インフラリソース

## 対象

- Aurora DSQL
- AWS Lambda
- API Gateway (HTTP API)
- Amazon S3 / CloudFront
- SSM Parameter Store

## 現状

- Aurora DSQL は stage ごとに作成、deletion protection は無効
- Lambda は Node.js 24、VPC 非参加
- API Gateway は `/graphql` を公開
- Web 配信は S3 + CloudFront
- shared contract は SSM で受け渡し

## 決定ログ

- YYYY-MM-DD: (ここに決定事項を追記)
