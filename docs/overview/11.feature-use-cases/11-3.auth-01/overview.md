# 11-3. auth-01

## 検証対象

- React Web での Cognito 認証導線（通常ログイン + MFA コード確認）
- GraphQL Authorizer による認可（未認証トークンでは GraphQL を通さない）

## 目的

- `../rehacul` と同等の認証の骨格を先に作り、11 系ユースケースで使い回せる土台を作る
- 過剰な分岐を避けつつ、11-3 時点で MFA の導線が成立することを確認する

## 構成（確定）

### Infra

- Auth は `ApiStack` 配下の Construct として配置している
- Cognito は `UserPool` / `Web Client` / `IdentityPool` 構成としている
- IdentityPool は `authenticated only`（未認証ゲストロールなし）構成としている
- IdentityPool の UserPool client 紐付けは Web 用のみとしている（function/test は対象外）
- `/graphql` は Lambda Authorizer 経由としている（未認証は API Gateway で拒否）
- UserPool trigger は `preAuthentication` / `preTokenGeneration` / `customMessage` を接続前提としている
- `clientId -> clientName` マップは SSM Parameter Store で管理する前提としている
- UserPool custom attributes は Custom Resource（Lambda バック）で拡張する前提としている

### Backend

- Authorizer context は最小で `userId`, `username`, `groups`, `institutionCode?` を扱う
- GraphQL は `me` Query で認証済みコンテキストを確認する構成としている

### Frontend

- `auth-provider` と `urql-provider` を分離する構成としている
- `Authorization` ヘッダーは自動付与する構成としている

## rehacul 同等化の方針

- 11-3 は「業務ロジックの完成」より「インフラ構造の同等化」を優先している
- trigger / SSM / custom attributes は、拡張ポイントとして先に箱を揃える方針としている
- trigger Lambda の中身は最小実装（no-op / event passthrough）を許容している
- 詳細な業務判定（client ごとの厳密制御など）は段階導入する整理としている

## UserPool Trigger の役割（要約）

- `preAuthentication`: サインイン確定前の検証ポイント（ログイン許可/拒否）
  - `clientId -> clientName` 判定に基づき、クライアント別ポリシーでログインを許可/拒否する
  - `app` クライアントでは利用者期限を DB 参照で確認し、期限切れ時は拒否する
- `preTokenGeneration`: トークン発行直前の加工ポイント（claim の調整）
  - `custom:mfa_preference` を claim に追加/上書きする
  - `custom:institution_id` がある場合のみ claim に追加する
  - `phone_number` / `email` などの個人情報系 claim を suppress する
- `customMessage`: Cognito 通知（メール/確認コード）の文面制御ポイント
  - 認証コード通知の本文を固定フォーマットで組み立てる
  - メール件名を固定値で設定する
  - 同一本文を `emailMessage` と `smsMessage` に設定する

## MFA（11-3で確認する範囲）

- `signIn` 後の `nextStep` に応じて確認コード入力 UI を出す導線としている
- `CONFIRM_SIGN_IN_WITH_SMS_CODE` / `CONFIRM_SIGN_IN_WITH_EMAIL_CODE` の導線を対象としている
- `confirmSignIn` 成功後に `me` Query が通ることを確認対象としている
- SMS/Email の運用最適化（配信品質、テンプレート詳細）は 11-3 対象外としている

## スコープ外（11-3）

- Maintenance 連携（bypass ヘッダー、メンテナンス画面分岐）
- WebView 専用トークン経路
- 管理者 Web / App / Test / Function 向けのクライアント分岐最適化

## 決定ログ

- 2026-04-28: IdentityPool は 11-3 で作成し、`authenticated only` 方針を採用
- 2026-04-28: IdentityPool 連携対象は Web client のみに限定する方針を採用
- 2026-04-28: 11-3 で MFA の最小導線（signIn -> confirm code）まで実装する方針を採用
- 2026-04-28: maintenance 連携は 11-3 対象外とする方針を採用
- 2026-04-28: `../rehacul` 同等化のため、UserPool triggers / SSM client map / custom attributes Custom Resource を 11-3 設計範囲に含める方針を採用
