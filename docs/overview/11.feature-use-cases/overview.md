# 11. 機能ユースケース (feature-use-cases)

## 対象

- アプリケーション機能をユースケース単位で検証するページ群
- 旧 `4.frontend` 配下に置いていた `4-1` 〜 `4-13` を本章へ移動・再採番
- 実装は `packages/web/src/domains/feature-use-cases/` 配下のドメインに対応

## 現状

- 各ユースケースは検証ページとして `packages/web/src/domains/feature-use-cases/<番号>.<名前>/` に置く
- ナビゲーション上は `11.feature-use-cases` をアコーディオン親ノードとして開閉する
- 個別ページは `pages/`、API 呼び出しは `hooks/` に分割する方針（実装済みは 11-1 のみ）

## 子フォルダ（検証ページ）

- [11-1.data-01](./11-1.data-01/overview.md)
- [11-2.data-02](./11-2.data-02/overview.md)
- [11-3.auth-01](./11-3.auth-01/overview.md)
- [11-4.auth-02](./11-4.auth-02/overview.md)
- [11-5.ops-01](./11-5.ops-01/overview.md)
- [11-6.oplog-01](./11-6.oplog-01/overview.md)
- [11-7.oplog-02](./11-7.oplog-02/overview.md)
- [11-8.livekit-01](./11-8.livekit-01/overview.md)
- [11-9.video-01](./11-9.video-01/overview.md)
- [11-10.video-auth-01](./11-10.video-auth-01/overview.md)
- [11-11.iot-01](./11-11.iot-01/overview.md)
- [11-12.iot-02](./11-12.iot-02/overview.md)
- [11-13.maintenance-01](./11-13.maintenance-01/overview.md)

## 決定ログ

- 2026-04-27: `4.frontend/4-1` 〜 `4-13` を `11.feature-use-cases/11-1` 〜 `11-13` へ移動。フロントエンド技術スタック観点（`4.frontend`）と機能ユースケース観点を分離する方針を採用
