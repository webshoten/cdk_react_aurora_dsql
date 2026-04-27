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

- 2026-04-27: `2.infra-resources` は stack 単位のサブフォルダ構成（`2-1`〜`2-6`）で管理する方針を追加
- 2026-04-27: S3 管理を `StorageStack` へ分離する方針を追加
- 2026-04-27: 11-2.data-02 は `image/` プレフィックスのみ利用する方針を追加
- 2026-04-27: Custom Resource ベストプラクティスをインフラのノウハウとして追加
- YYYY-MM-DD: (ここに決定事項を追記)
