# 10-2. Debug

## 目的

- アプリをローカル起動して素早く検証する

## 基本導線

1. VSCode で `local-dev: web+functions` を起動
2. `preLaunchTask` で `local-dev:resolve-env` を実行し、`.vscode/.local-dev.env` を更新
3. `functions` は Yoga をローカル起動
4. `web -> local Yoga` に向けて動作確認
5. `db` は Aurora DSQL 実環境を参照（`AWS_PROFILE` + DSQL 接続値）

## 起動方法

- 推奨: `.vscode/launch.json` の起動構成を使う
  - `local-dev: web+functions`
- 手動実行する場合:
  - Functions (Yoga): `pnpm --filter @pf/functions dev`
  - Web (Vite): `pnpm --filter @pf/web dev`

## 接続方針

- Web の環境変数読み取りは `config.js` から行う
- `local-dev:resolve-env` で `packages/web/public/config.js` を生成する
- ローカルデバッグ時の DB 接続先は Aurora DSQL の実環境を使う
- 接続関連の変動値（`DSQL_ENDPOINT` / `DSQL_CLUSTER_ARN`）は `cdk-outputs.json` から解決する
- 固定値（`DSQL_DATABASE` / `DSQL_DB_USER` / `DSQL_PORT` / `DSQL_REGION`）は `launch.json` で管理する
- `.env` は常用しない（`local-dev` では `.vscode/.local-dev.env` を使う）

## 切り分けポイント

- Web 側失敗: Vite コンソール / ブラウザコンソールを確認
- Functions 側失敗: Yoga ローカルサーバログを確認
- DB 接続失敗: `.vscode/.local-dev.env` と `AWS_PROFILE` を確認
