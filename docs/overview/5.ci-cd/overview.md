# 5. CI/CD

## 対象

- lint / test / build の自動化
- deploy 前検証
- 将来的な本番反映フロー

## 現状

- CI/CD は未整備
- ローカルでの確認は個別コマンドで実施

## 初期方針

- 最初に `lint / typecheck / test / build` の PR 自動実行を定義する
- deploy は手動承認を残し、段階的に自動化する
- 失敗時の通知先と再実行手順を同時に定義する
- CI/CD が参照する入力値は SSM Parameter Store の `/pf/cd/<sharedEnv>/env/...` で集中管理し、`/pf/shared/<sharedEnv>/...` とは責務を分離する
- `/pf/cd/<sharedEnv>/env/...` の設定・確認は `pnpm env:set` / `pnpm env:list` を運用コマンドとして利用する

## 決定ログ

- 2026-04-28: 決定ログのプレースホルダを廃止し、初期方針を明文化
- 2026-05-02: CI/CD 入力値の SSM 命名を `/pf/cd/<sharedEnv>/env/...` に統一する方針を追加
- 2026-05-02: CD入力値の運用コマンドを `pnpm env:set` / `pnpm env:list` に統一
