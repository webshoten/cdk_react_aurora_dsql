# 2. インフラリソース

## 対象

- stack 単位の管理対象
- stack 間の責務分離
- 運用上の共通ノウハウ

## 現状

- stack 別に `overview.md` を分割して管理する
- `shared` 層と `app` 層の責務分離を前提に運用する

## Stack 別設計

- [2-1.shared-stack](./2-1.shared-stack/overview.md)
- [2-2.db-stack](./2-2.db-stack/overview.md)
- [2-3.api-stack](./2-3.api-stack/overview.md)
- [2-4.ops-stack](./2-4.ops-stack/overview.md)
- [2-5.storage-stack](./2-5.storage-stack/overview.md)
- [2-6.web-stack](./2-6.web-stack/overview.md)
- [2-7.auth-stack](./2-7.auth-stack/overview.md)

## 階層構造

- `SharedStack`: `packages/infra/lib/stacks/shared/shared-stack.ts`
  - `SharedMetaConstruct`: `packages/infra/lib/constructs/shared/meta.ts`
  - `SharedSesConstruct`: `packages/infra/lib/constructs/shared/ses.ts`
  - `SharedLookupConstruct`: `packages/infra/lib/constructs/shared/lookup.ts`
- `DbStack`: `packages/infra/lib/stacks/app/db-stack.ts`
  - `DbConstruct`: `packages/infra/lib/constructs/app/db/index.ts`
- `ApiStack`: `packages/infra/lib/stacks/app/api-stack.ts`
  - `ApiConstruct`: `packages/infra/lib/constructs/app/api/index.ts`
  - `GraphqlApiConstruct`: `packages/infra/lib/constructs/app/api/graphql.ts`
- `AuthStack`: `packages/infra/lib/stacks/app/auth-stack.ts`
  - `AuthConstruct`: `packages/infra/lib/constructs/app/auth/index.ts`
  - `AuthTriggerConstruct`: `packages/infra/lib/constructs/app/auth/triggers.ts`
  - `GraphqlAuthorizerConstruct`: `packages/infra/lib/constructs/app/auth/authorizer.ts`
  - `ClientIdNameMapConstruct`: `packages/infra/lib/constructs/app/auth/client-id-name-map.ts`
- `OpsStack`: `packages/infra/lib/stacks/app/ops-stack.ts`
  - `OpsConstruct`: `packages/infra/lib/constructs/app/ops/index.ts`
- `StorageStack`: `packages/infra/lib/stacks/app/storage-stack.ts`
  - `StorageConstruct`: `packages/infra/lib/constructs/app/storage/index.ts`
- `WebStack`: `packages/infra/lib/stacks/app/web-stack.ts`
  - `WebConstruct`: `packages/infra/lib/constructs/app/web/index.ts`

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

- 2026-04-27: `2.infra-resources` は stack 単位のサブフォルダ構成（`2-1`〜`2-7`）で管理する方針を追加
- 2026-04-27: S3 管理を `StorageStack` へ分離する方針を追加
- 2026-04-27: 11-2.data-02 は `image/` プレフィックスのみ利用する方針を追加
- 2026-04-27: Custom Resource ベストプラクティスをインフラのノウハウとして追加
- 2026-04-28: 決定ログのプレースホルダを廃止し、日付付き追記方式へ統一
- 2026-04-28: 認証基盤を `AuthStack` として分離し、`AuthConstruct` を `constructs/app/auth/index.ts` に配置する方針を追加
