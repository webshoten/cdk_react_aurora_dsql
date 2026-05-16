# 10-2. Debug

## 目的

- アプリをローカル起動して素早く検証する

## 基本導線

1. VSCode で `local-dev: web+functions` を起動
2. `preLaunchTask` で `local-dev:resolve-env` を実行し、`.vscode/.local-dev.env` を更新
3. `functions` は Yoga をローカル起動
4. `web -> local Yoga` に向けて動作確認
5. `db` は Aurora DSQL 実環境を参照（`AWS_PROFILE` + DSQL 接続値）
6. AI から DOM 観測する場合は同一統合ターミナルから `claude` / `codex` を起動する（詳細: `docs/overview/9.ai/9-1.playwright-mcp/overview.md`）

## 起動方法

- 推奨: `.vscode/launch.json` の起動構成を使う
  - `local-dev: web+functions`
- 手動実行する場合:
  - Functions (Yoga): `pnpm --filter @pf/functions dev`
  - Web (Vite): `pnpm --filter @pf/web dev`
- AI MCP（Playwright MCP）併用時:
  - 別 terminal で `export PLAYWRIGHT_MCP_EXTENSION_TOKEN=<拡張取得値>` してから AI クライアントを起動
  - 詳細手順: `docs/overview/9.ai/plan/9-1.playwright-mcp.md`

## 接続方針

- Web の環境変数読み取りは `config.js` から行う
- `local-dev:resolve-env` で `packages/web/public/config.js` を生成する
- ローカルデバッグ時の DB 接続先は Aurora DSQL の実環境を使う
- 接続関連の変動値（`DSQL_ENDPOINT` / `DSQL_CLUSTER_ARN`）は `cdk-outputs.json` から解決する
- 固定値（`DSQL_DATABASE` / `DSQL_DB_USER` / `DSQL_PORT` / `AWS_REGION`）は `launch.json` で管理する
- `.env` は常用しない（`local-dev` では `.vscode/.local-dev.env` を使う）
- ローカル `web` の DOM・Console は AI クライアント経由で Playwright MCP（拡張ブリッジ）から観測する
- 観測用 token は各開発者が terminal で `export` し、AI クライアントへ環境変数として継承する（リポジトリ管理しない）

## 切り分けポイント

- Web 側失敗: Vite コンソール / ブラウザコンソールを確認
- Functions 側失敗: Yoga ローカルサーバログを確認
- DB 接続失敗: `.vscode/.local-dev.env` と `AWS_PROFILE` を確認
