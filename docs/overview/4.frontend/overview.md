# 4. フロントエンド

## 対象

- `packages/web`
- React + Vite
- `config.js` による runtime 設定

## 現状

- API URL は build 時埋め込みではなく `config.js` で注入
- Web の環境変数読み取りは `config.js` から行う
- deploy 時は `BucketDeployment` の `Source.data("config.js", ...)` で生成する
- 配信は CloudFront / S3 前提
- GraphQL `seedItems` を表示

## 全体設計（ナビゲーション）

- 左サイドバーは `docs/overview` の章構成に対応させる
- サイドバーには `1` 〜 `10` の章を表示する
- サイドバーのリンク名は章番号ベースで表示する（例: `4-1.data-01`）
- 右ペインは選択中ページのプレビュー領域とする
- `1.architecture` はアーキテクチャ図表示ページとして扱う
- `4.frontend` 配下の `4-1` 以降は検証ページとして扱う
- `4.frontend` は親ノードとしてアコーディオン表示（開閉可能）にする
- 開閉状態の保持方式は固定せず、まずはシンプルな実装を優先する
- 設計と実装の同期を保つため、ページ追加時は `docs/overview/4.frontend` の対応フォルダを先に作成する

## 子フォルダ（検証ページ）

- [4-1.data-01](./4-1.data-01/overview.md)
- [4-2.data-02](./4-2.data-02/overview.md)
- [4-3.auth-01](./4-3.auth-01/overview.md)
- [4-4.auth-02](./4-4.auth-02/overview.md)
- [4-5.ops-01](./4-5.ops-01/overview.md)
- [4-6.oplog-01](./4-6.oplog-01/overview.md)
- [4-7.oplog-02](./4-7.oplog-02/overview.md)
- [4-8.livekit-01](./4-8.livekit-01/overview.md)
- [4-9.video-01](./4-9.video-01/overview.md)
- [4-10.video-auth-01](./4-10.video-auth-01/overview.md)
- [4-11.iot-01](./4-11.iot-01/overview.md)
- [4-12.iot-02](./4-12.iot-02/overview.md)
- [4-13.maintenance-01](./4-13.maintenance-01/overview.md)

## 決定ログ

- 2026-04-26: 検証ページの初期スコープとして 12 件（data/auth/ops/oplog/livekit/video/iot）を定義
- 2026-04-26: フロントの左サイドバーは `docs/overview` の章構成と連動させる方針を採用
- 2026-04-26: `4-13.maintenance-01` を追加（CloudFront + Lambda@Edge を含むメンテナンス画面/バイパス検証）
