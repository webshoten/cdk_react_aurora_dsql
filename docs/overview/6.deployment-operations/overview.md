# 6. デプロイ運用

## 対象

- deploy / destroy 手順
- stage / profile / sharedEnv の扱い
- 運用時の確認ポイント

## 現状

- deploy 順序
  - `shared`
  - `app`
- destroy 順序
  - `app`
  - `shared`
- `stage` 未指定時は `whoami`
- `profile` 未指定時は `AWS_PROFILE`、なければ `default`
- CD 入力値は `/pf/cd/<sharedEnv>/env/...` を利用し、設定は `pnpm env:set`、確認は `pnpm env:list` を利用する
- `pnpm env:set` / `pnpm env:list` の `profile` 未指定時は `AWS_PROFILE`、なければ `default` を利用する

## 運用ルール

- deploy / destroy 実行中は CDK 構成変更を止める
- 実行前後で対象 stage と stack を明示して確認する
- 問題発生時は CloudWatch Logs の事実ログを先に記録する

## 決定ログ

- 2026-04-28: 決定ログのプレースホルダを廃止し、運用ルールを明文化
