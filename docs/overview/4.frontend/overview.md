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
- サイドバーには `1` 〜 `11` の章を表示する
- 右ペインは選択中ページのプレビュー領域とする
- `1.architecture` はアーキテクチャ図表示ページとして扱う
- 機能ユースケースの各検証ページは `docs/overview/11.feature-use-cases` に対応するルートとして扱う
- `11.feature-use-cases` は親ノードとしてアコーディオン表示（開閉可能）にする
- 開閉状態の保持方式は固定せず、まずはシンプルな実装を優先する

## 決定ログ

- 2026-04-26: 検証ページの初期スコープとして 12 件（data/auth/ops/oplog/livekit/video/iot）を定義
- 2026-04-26: フロントの左サイドバーは `docs/overview` の章構成と連動させる方針を採用
- 2026-04-26: `4-13.maintenance-01` を追加（CloudFront + Lambda@Edge を含むメンテナンス画面/バイパス検証）
- 2026-04-27: 検証ページ群（旧 `4-1` 〜 `4-13`）を `11.feature-use-cases` 配下へ移動。`11-1` 〜 `11-13` に再採番。`4.frontend` はフロントエンド技術スタック概要のみ残す
