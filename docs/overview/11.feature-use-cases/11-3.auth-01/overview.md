# 11-3. auth-01

## 検証対象

- React Web での Cognito 認証導線（通常ログイン + MFA コード確認）
- GraphQL Authorizer による認可（未認証トークンでは GraphQL を通さない）
- Web 全体を認証必須とし、未認証アクセスを許可しない導線
- サインアップ導線を設けず、script で作成したユーザーでログインできること

## 目的

- `../rehacul` と同等の認証の骨格を先に作り、11 系ユースケースで使い回せる土台を作る
- 過剰な分岐を避けつつ、11-3 時点で MFA の導線が成立することを確認する

## 構成

### Infra

- Auth は `AuthStack` 配下の Construct として配置している
- Cognito は `UserPool` / `Web Client` / `IdentityPool` 構成としている
- Web Client の `ExplicitAuthFlows` は `ALLOW_USER_SRP_AUTH` / `ALLOW_USER_PASSWORD_AUTH` / `ALLOW_REFRESH_TOKEN_AUTH` を有効化する
- UserPool は自己サインアップを有効のままとし、11-3 では設定変更しない構成としている
- IdentityPool は `authenticated only`（未認証ゲストロールなし）構成としている
- IdentityPool の UserPool client 紐付けは Web 用のみとしている（function/test は対象外）
- `/graphql` は Lambda Authorizer 経由としている（未認証は API Gateway で拒否）
- UserPool trigger は `preAuthentication` / `preTokenGeneration` / `customMessage` を接続前提としている
- `clientId -> clientName` マップは SSM Parameter Store で管理する前提としている
- UserPool custom attributes は `UserPool.customAttributes` で定義する前提としている
- 対象 ID は `custom:institution_id` / `custom:mfa_preference` とする

### Backend

- Authorizer context は最小で `userId`, `username`, `groups`, `institutionCode?` を扱う
- GraphQL は `currentUser` Query で認証済みコンテキストを確認する構成としている
- `me` Query は採用せず、認証済みユーザー確認の Query 名は `currentUser` に統一する
- Authorizer context は API Gateway の `requestContext.authorizer` を server context 経由で resolver に渡す

### Frontend

- `auth-provider` と `urql-provider` を分離する構成としている
- `Authorization` ヘッダーは自動付与する構成としている
- runtime 設定は `packages/web/public/config.js` の `window.__CONFIG__` から解決する構成としている
- 認証に必要な設定キーは `cognitoRegion` / `userPoolId` / `userPoolClientId` としている
- local-dev では `local-dev:resolve-env` 実行時に `packages/web/public/config.js` を再生成する構成としている
- アプリ全体を認証ガード配下に置き、未認証時はログイン導線へ遷移させる構成としている
- 認証導線の実装手段は `rehacul` 継承を優先し、Amplify Auth（`signIn` / `confirmSignIn` / `nextStep`）と Amplify UI ベースで統一する
- Amplify の token storage は `CookieStorage` を利用する
- サインアップ UI は提供しない構成としている
- ログイン画面は `/login` に分離する構成としている
- `11-3.auth-01` ではログインとユーザー作成の仕様をまとめて扱う構成としている
- `11-3.auth-01` は説明専用とし、試験実行ボタンやデバッグ操作は配置しない
- デバッグ機能は `main` と同列の `/debug` ルートに集約する

## 画面責務

- `/login` はエンドユーザー向けの認証入口とする
- ユーザー作成は運用者向け機能とし、一般ユーザー向け導線とは分離する
- `11-3.auth-01` はログインとユーザー作成の仕様説明を集約するページとして扱う
- `/debug` は認証済みユーザー向けの検証・運用補助ページとして扱う
- `/debug` は認証済みユーザーであれば全員アクセス可能とする
- `/debug` ではトークン表示/コピー、claim 確認、認証付き GraphQL 疎通確認、ユーザー作成実行、ユーザー一覧表示を扱う
  - 補足: ユーザー一覧はテーブル表示とし、各行に「パスワード再設定」ボタンを配置する
  - 補足: ボタン押下時は新しい一時パスワードを発行し、その発行値のみ画面表示する（既存パスワード参照は行わない）
  - 補足: パスワード値は運用ログ（CloudWatch / アプリログ）に出力しない

## ユーザー作成方針

- 本ユースケースではサインアップ機能を実装せず、ユーザーは script で作成する
- script は Cognito ユーザー作成と `users` テーブル登録を同一フローで実行する
- `users.uid` には Cognito の `sub` を保存する
- `user_type` は `general` 固定とする
- script の入力は `username` / `password` / `email` を必須とする
- script では `email_verified=true` を設定し、検証済みメールとして作成する
- script は既存運用に合わせて SEA 実行前提とする
- パスワード運用は、作成時は `Permanent=true`（初回変更必須なし）、再設定時は `Permanent=false`（次回ログイン時に変更必須）とする
- 既存ユーザー判定は `username` 重複のみを対象とし、重複時はエラー終了する
- DB 登録は Cognito 作成直後に実行する
- CloudWatch ログには `password` を出力しない
- script 実行時の失敗パターンを考慮し、再実行時に不整合を増やさない冪等実行を前提とする

## rehacul 同等化の方針

- 11-3 は「業務ロジックの完成」より「インフラ構造の同等化」を優先している
- trigger / SSM / custom attributes は、拡張ポイントとして先に箱を揃える方針としている（custom attributes は `customAttributes` で先に定義）
- trigger Lambda の中身は最小実装（no-op / event passthrough）を許容している
- 詳細な業務判定（client ごとの厳密制御など）は段階導入する整理としている

## UserPool Trigger の役割

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

## MFA

- `signIn` 後の `nextStep` に応じて確認コード入力 UI を出す導線としている
- `CONFIRM_SIGN_IN_WITH_SMS_CODE` / `CONFIRM_SIGN_IN_WITH_EMAIL_CODE` の導線を対象としている
- `confirmSignIn` 成功後に `currentUser` Query が通ることを確認対象としている
- SMS/Email の運用最適化（配信品質、テンプレート詳細）は 11-3 対象外としている
- MFA 導線の API / UI 実装は Amplify ベースを前提とし、同等挙動を AWS SDK 低レベル API へ置換しない

## スコープ外

- Maintenance 連携（bypass ヘッダー、メンテナンス画面分岐）
- WebView 専用トークン経路
- 管理者 Web / App / Test / Function 向けのクライアント分岐最適化

## 決定ログ

- 2026-04-28: IdentityPool は 11-3 で作成し、`authenticated only` 方針を採用
- 2026-04-28: IdentityPool 連携対象は Web client のみに限定する方針を採用
- 2026-04-28: 11-3 で MFA の最小導線（signIn -> confirm code）まで実装する方針を採用
- 2026-04-28: maintenance 連携は 11-3 対象外とする方針を採用
- 2026-04-28: `../rehacul` 同等化のため、UserPool triggers / SSM client map / custom attributes を 11-3 設計範囲に含める方針を採用
- 2026-04-29: custom attributes の実装方式は `UserPool.customAttributes` を採用。対象 ID は `custom:institution_id` / `custom:mfa_preference`。11-3 は UserPool 新規作成前提であり、Custom Resource を使わなくても要件を満たせるため、構成と運用を簡素化する。
- 2026-04-28: Web 全体を認証必須とし、匿名アクセスを許可しない方針を採用
- 2026-04-28: サインアップ UI は採用せず、11-3 の検証ユーザーは運用 script で作成する方針を採用
- 2026-04-28: UserPool の自己サインアップ設定は ON のまま維持し、11-3 では変更しない方針を採用
- 2026-04-28: script 作成ユーザーの `user_type` は `general` 固定とし、`username` 重複時はエラー終了する方針を採用
- 2026-04-28: script 入力は `username` / `password` / `email` を必須とし、Cognito 作成直後に `sub` を `users.uid` へ保存する方針を採用
- 2026-04-28: ログイン画面は `/login` に分離し、`11-3.auth-01` はログインとユーザー作成の仕様説明を集約する方針を採用
- 2026-04-28: script 作成時は `email_verified=true` を設定する方針を採用
- 2026-04-28: ユーザー作成 script は既存の script 実行方針に合わせて SEA 実行前提とする方針を採用
- 2026-04-28: `11-3.auth-01` は説明専用とし、実運用のデバッグ機能は `main` と同列の `/debug` ルートへ集約する方針を採用
- 2026-04-28: `/debug` は認証済みユーザー全員に開放し、ユーザー作成は画面から直接 mutation 実行で行う方針を採用
- 2026-04-28: ユーザー作成は script 経由と `/debug` 画面経由の2経路を併用する方針を採用
- 2026-04-28: `/debug` にユーザー一覧表示を追加する方針を採用
- 2026-04-29: 現在実装は Amplify Auth（`signIn` / `confirmSignIn` / `nextStep`）までを先行し、ログイン UI は独自フォームのまま。設計要件である Amplify UI ベース統一には未達のため、次実装で UI も Amplify UI へ揃える。

## 改善点

- UserPool 自己サインアップを OFF に切り替える是非を 11-4 以降で再評価する
- Web 全体を認証必須にする際の例外ページ（`/login` / `404`）の扱いを明確化する
- 未認証アクセス時の遷移先を `/login` に固定し、実装方式（router guard）を統一する
- サインアップ非採用時の初期ユーザー配布手順（通知経路・一時パスワード運用）を定義する
- script によるユーザー作成時、`Cognito` と `users` テーブルの不整合を防ぐ冪等仕様を定義する
- `users.uid = Cognito sub` を正式仕様として明文化し、他テーブル参照方針を統一する
- ユーザー作成 script の入力項目（`user_type`, `email`, `mfa_preference` など）を固定する
- 失敗時のロールバック方針（Cognito 作成済み / DB 未登録など）を運用手順に追加する
- 既存ユーザーが存在する場合は script をエラー終了する仕様を明文化する
- MFA 初期値を `email` 固定とし、SMS は対象外とする方針を明文化する
- 監査ログ（誰がいつ script でユーザー作成したか）の記録方式を決める
- script の CloudWatch ログ出力形式（開始/成功/失敗、username/sub、失敗理由）を定義する
- `11-3` と `11-4` の責務境界（11-3 は土台、11-4 で運用詳細）を追記する
- token storage を `CookieStorage` とする方針の妥当性（HttpOnly 非対応時の XSS リスク、BFF + HttpOnly 化の要否）を再評価する
