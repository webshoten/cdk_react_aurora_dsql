# 2. インフラリソース

## 対象

- stack 単位の管理対象
- stack 間の責務分離
- 運用上の共通ノウハウ

## 現状

- stack 別に `overview.md` を分割して管理する
- `shared` 層と `app` 層の責務分離を前提に運用する
- stack はリソース種別ではなく機能責務で分割する（vertical）

## Stack 配置判定ルール

- 単一機能専用のリソースは、その機能の stack に配置する
- 複数機能で共有する基盤リソースのみ、共通 stack（shared / 横断基盤）へ配置する
- 配置判断は「どの機能のためのリソースか」「どの機能変更と同時に見直すことが多いか」を優先する
- 既存の stack 責務と矛盾する配置を避け、責務が変わる場合は先に責務定義を更新してから配置を変更する

## iot-02 への適用方針

- iot-02 で追加する IoT メッセージ保存経路（IoT Rule / Firehose / S3）は Realtime 機能責務として `2-9.realtime-stack` で管理する
- `StorageStack` は既存方針どおり画像用途に限定する

## Stack 別設計

- [2-1.shared-stack](./2-1.shared-stack/overview.md)
- [2-2.db-stack](./2-2.db-stack/overview.md)
- [2-3.api-stack](./2-3.api-stack/overview.md)
- [2-4.ops-stack](./2-4.ops-stack/overview.md)
- [2-5.storage-stack](./2-5.storage-stack/overview.md)
- [2-6.web-stack](./2-6.web-stack/overview.md)
- [2-7.auth-stack](./2-7.auth-stack/overview.md)
- [2-8.domain](./2-8.domain/overview.md)
- [2-9.realtime-stack](./2-9.realtime-stack/overview.md)

## 階層構造

- `SharedStack`: `packages/infra/lib/stacks/shared/shared-stack.ts`
  - `SharedMetaConstruct`: `packages/infra/lib/constructs/shared/meta/index.ts`
  - `SharedSesConstruct`: `packages/infra/lib/constructs/shared/ses/index.ts`
  - `SharedHostedZoneConstruct`: `packages/infra/lib/constructs/shared/hosted-zone/index.ts`
  - `SharedIotEndpointConstruct`: `packages/infra/lib/constructs/shared/iot-endpoint/index.ts`
- `SharedUsEast1ParamsStack`: `packages/infra/lib/stacks/shared/shared-us-east-1-params-stack.ts`
  - `us-east-1` に `/pf/shared/<sharedEnv>/{meta,domain,ses}/*` を同期する
- `DbStack`: `packages/infra/lib/stacks/app/db-stack.ts`
  - `DbConstruct`: `packages/infra/lib/constructs/app/db/index.ts`
- `ApiStack`: `packages/infra/lib/stacks/app/api-stack.ts`
  - `ApiConstruct`: `packages/infra/lib/constructs/app/api/index.ts`
  - `GraphqlApiConstruct`: `packages/infra/lib/constructs/app/api/graphql.ts`
  - `GraphqlAuthorizerConstruct`: `packages/infra/lib/constructs/app/api/graphql-authorizer.ts`
- `AuthStack`: `packages/infra/lib/stacks/app/auth-stack.ts`
  - `AuthConstruct`: `packages/infra/lib/constructs/app/auth/index.ts`
  - `AuthTriggerConstruct`: `packages/infra/lib/constructs/app/auth/triggers.ts`
  - `ClientIdNameMapConstruct`: `packages/infra/lib/constructs/app/auth/client-id-name-map.ts`
- `RealtimeStack`: `packages/infra/lib/stacks/app/realtime-stack.ts`
  - `RealtimeConstruct`: `packages/infra/lib/constructs/app/realtime/index.ts`
  - `RealtimeCustomAuthorizerConstruct`: `packages/infra/lib/constructs/app/realtime/custom-authorizer.ts`
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
- 2026-05-03: ドメイン管理境界を `2-8.domain` として分離し、`proto-foundation.com` 前提の設計を追加
- 2026-05-05: `us-east-1` で shared SSM 参照が必要な stack 向けに `SharedUsEast1ParamsStack` を追加し、`/pf/shared/<sharedEnv>/*` を同期する方針を追加
- 2026-05-06: リアルタイム配信責務を `RealtimeStack` として分離し、IoT custom authorizer を `constructs/app/realtime` に配置する方針を追加
- 2026-05-06: IoT Data endpoint の取得責務は `SharedStack` の `SharedIotEndpointConstruct` に集約し、`RealtimeStack` 側の `iot:DescribeEndpoint` カスタムリソースを廃止して app stack 群は SSM 経由で参照する方針を追加（理由: IoT Data endpoint はアカウント+リージョン+endpointType（`iot:Data-ATS`）単位で固定されるため、stack ごとに取得すると重複し、`iot:DescribeEndpoint` の API クォータも消費する）
- 2026-05-09: `rehacul` の `sst.aws.Realtime` helper 構成との差分として、`cdk_pf` は IoT Custom Authorizer を `AWS::IoT::Authorizer` と Lambda `policyDocuments` 返却で明示実装する方針を追加（AWS 公式の Custom Authorizer ポリシー形式に準拠）
