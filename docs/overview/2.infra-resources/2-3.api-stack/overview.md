# 2-3. ApiStack

## 対象

- `ApiStack`
- HTTP API + GraphQL Lambda

## 責務

- stage 単位の API 提供レイヤーを管理する
- `/graphql` エンドポイントを提供する
- 認証基盤は `AuthStack` の出力を参照して適用する
- `api.<stage>.proto-foundation.com` の公開経路を管理する

## 管理リソース

- `AWS::ApiGatewayV2::Api`（HTTP API）
- `AWS::ApiGatewayV2::DomainName`（API カスタムドメイン）
- `AWS::ApiGatewayV2::ApiMapping`（ステージとドメインの関連付け）
- `AWS::Route53::RecordSet`（API カスタムドメイン Alias）
- `AWS::Lambda::Function`（GraphQL）
- `AWS::Logs::LogGroup`（GraphQL ログ）
- `AWS::CertificateManager::Certificate`（`ap-northeast-1` / API 用）

## ドメイン仕様

- `API公開ドメイン`: `api.<stage>.proto-foundation.com` を利用する
  - API Gateway は Regional カスタムドメインを利用する
  - API 用証明書は `ap-northeast-1` の ACM を利用する
  - stage 固有 FQDN のため、証明書/マッピング/Alias は ApiStack 内で管理する
  - 理由: API 側で公開エンドポイントを追加しても SharedStack の更新を不要にするため
- `CORS`: stage ごとに Web Origin を限定する
  - 許可Originは `web.<stage>.proto-foundation.com` を利用する
  - ローカル検証用 Origin（`http://localhost:5173`）を開発環境で許可する

## 依存関係

- `DbStack`: GraphQL Lambda の DB 接続情報を参照する
- `StorageStack`: 画像ストレージ参照設定を受け取る
- `AuthStack`: Authorizer / UserPool 連携に必要な認証設定値を参照する
- `Domain(2-8)`: 命名規約と証明書リージョン方針を参照する

## 決定ログ

- 2026-04-28: 決定ログのプレースホルダを廃止し、日付付き追記方式へ統一
- 2026-04-28: 認証基盤分離に合わせ、`ApiStack` は `AuthStack` の認証設定値を参照する方針を追加
- 2026-05-03: API 公開URLを `api.<stage>.proto-foundation.com` へ統一し、Regional API 用 ACM（`ap-northeast-1`）を利用する方針を追加
