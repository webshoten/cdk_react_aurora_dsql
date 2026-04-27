# 2-5. StorageStack

## 対象

- `StorageStack`
- 画像用途の S3

## 責務

- stage 単位の画像ストレージを提供する
- 初期スコープでは `image/` プレフィックス用途を管理する

## 管理リソース

- `AWS::S3::Bucket`（image 保存）

## 決定ログ

- 2026-04-27: 11-2.data-02 は `image/` プレフィックスのみ利用する方針を採用
- YYYY-MM-DD: (ここに決定事項を追記)
