# 2-1. SharedStack

## 対象

- `SharedStack`
- `SharedUsEast1ParamsStack`
- 環境共通の基盤情報

## 責務

- システム全体で共有する基盤情報・共通前提を管理する
- app stack が参照する共通値を提供する
- `us-east-1` で shared 参照が必要な stack 向けに shared 契約値を同期する

## 管理リソース

- `AWS::SSM::Parameter`（`/pf/shared/<sharedEnv>/meta/*`）
- `AWS::SSM::Parameter`（`/pf/shared/<sharedEnv>/domain/*`）
- `AWS::SES::EmailIdentity`（`${sharedEnv}.${HOSTED_ZONE_NAME}` 由来の送信元 domain identity）
- `AWS::SSM::Parameter`（`/pf/shared/<sharedEnv>/ses/*`）
- `AWS::SSM::Parameter`（`us-east-1` の `/pf/shared/<sharedEnv>/{meta,domain,ses}/*` 同期先）
- 命名規約: SharedStack が管理する共有基盤値は `/pf/shared/<sharedEnv>/...` を利用し、CI/CD 用の入力値は `/pf/cd/<sharedEnv>/env/...` に分離する
- SES identity domain は `${sharedEnv}.${HOSTED_ZONE_NAME}` を利用する
- SES 送信元アドレスは `no-reply@${sharedEnv}.${HOSTED_ZONE_NAME}` を利用する
- SES の DKIM 検証レコードは `HOSTED_ZONE_NAME` の Hosted Zone へ作成し、`${sharedEnv}.${HOSTED_ZONE_NAME}` identity を検証する
- ドメイン取得元は IaC 管理対象外とし、SharedStack は取得済みドメインの送信 identity 管理に責務を限定する

## 構成

- `SharedMetaConstruct`: `packages/infra/lib/constructs/shared/meta/index.ts`
- `SharedSesConstruct`: `packages/infra/lib/constructs/shared/ses/index.ts`
- `SharedHostedZoneConstruct`: `packages/infra/lib/constructs/shared/hosted-zone/index.ts`
- `SharedUsEast1ParamsStack`: `packages/infra/lib/stacks/shared/shared-us-east-1-params-stack.ts`
- `SharedLookupConstruct`: `packages/infra/lib/constructs/shared/lookup/index.ts`

## 決定ログ

- 2026-04-28: 決定ログのプレースホルダを廃止し、日付付き追記方式へ統一
- 2026-05-02: SSM Parameter 命名を shared 用と cd 用で分離する方針を明文化
- 2026-05-02: SharedStack の責務を meta 管理と SES 管理で Construct 分離する方針を追加
- 2026-05-03: SES 送信元を `proto-foundation.com` ドメイン配下アドレスへ統一し、ドメイン取得自体は IaC 管理対象外とする方針を追加
- 2026-05-04: SES identity は `${sharedEnv}.${HOSTED_ZONE_NAME}` を実体として作成し、`fromEmail` と整合させる方針を明文化
- 2026-05-05: `us-east-1` の stack も `SharedLookupConstruct` を維持できるよう、shared 契約値を `SharedUsEast1ParamsStack` で同名 SSM に同期する方針を追加
