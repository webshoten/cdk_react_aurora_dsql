# 2-7. auth-stack

## 対象

- 認証基盤（Cognito / IdentityPool / Trigger）
- 認証設定の stack 単位管理

## 役割

- `AuthStack` は認証リソースを集約して管理する
- `ApiStack` / `WebStack` へ認証設定値（UserPool / Client / IdentityPool）を提供する

## 構成

- `SharedLookupConstruct`
- `AuthConstruct`（`constructs/app/api/auth.ts`）

## 決定ログ

- 2026-04-28: 認証基盤を `AuthStack` として分離する方針を追加
