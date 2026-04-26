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

## 決定ログ

- YYYY-MM-DD: (ここに決定事項を追記)
