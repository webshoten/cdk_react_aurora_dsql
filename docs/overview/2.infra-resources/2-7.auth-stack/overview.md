# 2-7. auth-stack

## 対象

- 認証基盤（Cognito / IdentityPool / Trigger）
- 認証設定の stack 単位管理

## 役割

- `AuthStack` は認証リソースを集約して管理する
- `ApiStack` / `WebStack` へ認証設定値（UserPool / Client / IdentityPool）を提供する
- Email MFA の送信設定は SharedStack が提供する SES 関連値を参照し、Cognito UserPool の `emailConfiguration` に接続する
  - 参照元は `/pf/shared/<sharedEnv>/ses/fromEmail` と `/pf/shared/<sharedEnv>/ses/fromEmailArn`

## 構成

- `SharedLookupConstruct`
- `AuthConstruct`（`constructs/app/auth/index.ts`）
- `AuthTriggerConstruct`（`constructs/app/auth/triggers.ts`）
- `GraphqlAuthorizerConstruct`（`constructs/app/auth/authorizer.ts`）
- `ClientIdNameMapConstruct`（`constructs/app/auth/client-id-name-map.ts`）

## 決定ログ

- 2026-04-28: 認証基盤を `AuthStack` として分離する方針を追加
- 2026-05-02: SES identity を SharedStack 管理とし、AuthStack で Cognito `emailConfiguration` に接続する方針を追加
