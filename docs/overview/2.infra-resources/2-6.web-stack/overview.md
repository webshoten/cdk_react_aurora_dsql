# 2-6. WebStack

## 対象

- `WebStack`
- Web 配信基盤

## 責務

- stage 単位の静的配信レイヤーを提供する
- S3 / CloudFront によるフロントエンド配信を管理する
- `web.<stage>.proto-foundation.com` の公開経路を管理する

## 管理リソース

- `AWS::S3::Bucket`（静的配信）
- `AWS::CloudFront::Distribution`
- `Custom::CDKBucketDeployment`（Web 配備）
- `AWS::Route53::RecordSet`（Web カスタムドメイン Alias）
- `AWS::CertificateManager::Certificate`（`us-east-1` / CloudFront 用）
- `AWS::SSM::Parameter`（参照元: `us-east-1` の `/pf/shared/<sharedEnv>/{meta,domain,ses}/*`）

## ドメイン仕様

- `Web公開ドメイン`: `web.<stage>.proto-foundation.com` を利用する
  - CloudFront カスタムドメインで公開する
  - CloudFront 用証明書は `us-east-1` の ACM を利用する
  - stage 固有 FQDN のため、証明書/Distribution 接続/Alias は WebStack 内で管理する
  - 理由: Web 側で公開エンドポイントを追加しても SharedStack の更新を不要にするため
- `設定配布`: `config.js` の `apiUrl` は API カスタムドメインを参照する
  - `https://api.<stage>.proto-foundation.com` を出力する
  - 出力値は CDK Outputs と `local-dev:resolve-env` で同期する

## 依存関係

- `Domain(2-8)`: 命名規約と証明書リージョン方針を参照する
- `ApiStack`: `config.js` 出力用の API URL を参照する
- `SharedStack(2-1)`: `WebCertificateStack(us-east-1)` が `SharedLookupConstruct` で参照する shared SSM を `SharedUsEast1ParamsStack` が同期する

## 決定ログ

- 2026-04-28: 決定ログのプレースホルダを廃止し、日付付き追記方式へ統一
- 2026-05-03: Web 公開URLを `web.<stage>.proto-foundation.com` へ統一し、CloudFront 用 ACM（`us-east-1`）を利用する方針を追加
- 2026-05-05: `WebCertificateStack(us-east-1)` の shared 参照を維持するため、shared 契約値を `us-east-1` に同期する方針を追加
