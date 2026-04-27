# 10. ローカル開発

## 対象

- ローカルでのデバッグ手順
- DB データ参照・確認手順

## 現状

- migration は `pnpm migrate` で `zip -> S3 upload -> Lambda invoke` 方式で実行する
- 実行結果の最終確認は CloudWatch Logs（`migration.invoke.success/failed`）で行う
- ローカルデバッグは `web(Vite)` と `functions(Yoga)` を直接起動し、API Gateway/Lambda 経路をバイパスする
- DB は Aurora DSQL 実環境を参照し、接続設定はローカル `.env.local` で管理する
- CDK 変更時は deploy/destroy 実行中確認を必須ルールとして運用する

## 構成

- `10-2.debug`: ローカル検証・デバッグ導線
- `10-3.db`: DB データ参照・確認

## 運用方針

- セットアップ手順は `README.md` を正本とし、本章では重複記載しない
- 実行手順は「再現できる最小コマンド列」で記述する
- 失敗時は先に事実（エラーメッセージ/ログ）を収集してから対処する
- 既存の運用ルール（`8.coding-rules`）と矛盾しないことを優先する

## 決定ログ

- 2026-04-26: `10.local-dev` 章を追加
- 2026-04-26: local 開発情報を `setup/debug/db/runbook` に分離する方針を採用
- 2026-04-26: `setup` は `README.md` と重複するため章から削除し、`debug/db` に集約
