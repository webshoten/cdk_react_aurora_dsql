# 2-6. WebStack

## 対象

- `WebStack`
- Web 配信基盤

## 責務

- stage 単位の静的配信レイヤーを提供する
- S3 / CloudFront によるフロントエンド配信を管理する

## 管理リソース

- `AWS::S3::Bucket`（静的配信）
- `AWS::CloudFront::Distribution`
- `Custom::CDKBucketDeployment`（Web 配備）

## 決定ログ

- 2026-04-28: 決定ログのプレースホルダを廃止し、日付付き追記方式へ統一
