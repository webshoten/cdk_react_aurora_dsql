# 2-1. SharedStack

## 対象

- `SharedStack`
- 環境共通の基盤情報

## 責務

- システム全体で共有する基盤情報・共通前提を管理する
- app stack が参照する共通値を提供する

## 管理リソース

- `AWS::SSM::Parameter`（`/pf/shared/<sharedEnv>/meta/*`）
- `AWS::SES::EmailIdentity`（`SES_FROM_EMAIL` 由来の送信元 identity）
- `AWS::SSM::Parameter`（`/pf/shared/<sharedEnv>/ses/*`）
- 命名規約: SharedStack が管理する共有基盤値は `/pf/shared/<sharedEnv>/...` を利用し、CI/CD 用の入力値は `/pf/cd/<sharedEnv>/env/...` に分離する

## 構成

- `SharedMetaConstruct`: `packages/infra/lib/constructs/shared/meta.ts`
- `SharedSesConstruct`: `packages/infra/lib/constructs/shared/ses.ts`
- `SharedLookupConstruct`: `packages/infra/lib/constructs/shared/lookup.ts`

## 決定ログ

- 2026-04-28: 決定ログのプレースホルダを廃止し、日付付き追記方式へ統一
- 2026-05-02: SSM Parameter 命名を shared 用と cd 用で分離する方針を明文化
- 2026-05-02: SharedStack の責務を meta 管理と SES 管理で Construct 分離する方針を追加
