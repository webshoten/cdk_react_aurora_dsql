# 9-1. Playwright MCP（ブラウザ操作 MCP）

## 対象

- AI（Claude Code / Codex CLI）からローカルブラウザを観測・操作する仕組み
- 対象 web: `packages/web`（Vite dev server `localhost:5173`）

## 目的

- AI に web の DOM スナップショット・Console ログ・ネットワーク・操作を扱わせる
- ユーザーの通常 Chrome タブ（ログイン状態・拡張保持）に接続する
- 操作シーケンスから Playwright テストコード生成の土台にする

## 構成要素

- Playwright MCP server: `npx @playwright/mcp@latest --extension`
- Chrome 拡張: `Playwright Extension`
- 認証 token: `PLAYWRIGHT_MCP_EXTENSION_TOKEN`
- AI クライアント設定: `.mcp.json`（Claude Code 用）/ `codex.toml`（Codex CLI 用）
- 起動構成: `.vscode/launch.json` の `local-dev: web+functions`（dev server 起動専用・token には関与しない）

## 接続フロー

1. IDE（VS Code or Cursor）から launch.json `local-dev: web+functions` を起動し、Vite + functions の dev server を立てる
2. Chrome 拡張`Playwright Extension`にてtoken発行し`.mcp.json` / `codex.toml` の該当箇所に貼り付ける
3. ClaudeまたはCodexを起動しmcpが使えることを確認する「いま開いているページをplaywright mcpでDOMスナップショットを取得して」
