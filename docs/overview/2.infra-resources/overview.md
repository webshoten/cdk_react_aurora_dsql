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

## ノウハウ（Custom Resource）

- `custom_resources.Provider` フレームワークを優先して採用する
- `Create` / `Update` / `Delete` を明示的に実装し、`PhysicalResourceId` は安定した設計にする
- 長時間処理は `isComplete` で非同期完了チェックを行い、`queryInterval` / `totalTimeout` を用途に合わせて調整する
- `logGroup` とログ保持期間を設定し、運用時に追跡しやすくする
- エラー時は確実に失敗を返し、スタックへの影響を想定して設計する
- 機密情報は出力しない。必要な場合のみ `NoEcho` を利用する
- `AwsCustomResource` はシングルトン Lambda に権限が蓄積しうるため、IAM は最小権限で設計する
- `installLatestAwsSdk` はコールドスタートや取得処理の影響を理解した上で利用する

## 決定ログ

- 2026-04-27: Custom Resource ベストプラクティスをインフラのノウハウとして追加
- YYYY-MM-DD: (ここに決定事項を追記)
