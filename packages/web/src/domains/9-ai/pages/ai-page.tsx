import { Card, CardContent, CardHeader } from "@/shared/ui/card.tsx";

/*
 * # 9. AI ページ
 *
 * ## 目的
 * AI（Claude Code / Codex CLI）と本プロジェクトの統合状態を開発者向けに可視化する。
 * docs/overview/9.ai に対応する。
 *
 * ## 構成
 * - 9-1. Playwright MCP（ブラウザ操作 MCP）
 *
 * ## 9-1. Playwright MCP
 * - 目的: ローカル web の DOM・Console・操作を AI から扱う
 * - server: npx @playwright/mcp@latest --extension
 * - 拡張: Playwright MCP Bridge（Microsoft 公式）
 * - token: PLAYWRIGHT_MCP_EXTENSION_TOKEN（terminal で export してから AI 起動）
 * - 詳細: docs/overview/9.ai/9-1.playwright-mcp/overview.md
 * - 導入: docs/overview/9.ai/plan/9-1.playwright-mcp.md
 *
 * ## NOTE
 * - 設計可視化目的のページ。実機能なし。
 * - 将来 9-2 以降 MCP/Skill 追加時はこのページ内に節として並べる。
 */
export function AiPage() {
  return (
    <Card>
      <CardHeader />
      <CardContent>
        <section className="space-y-6">
          <header>
            <h1 className="text-lg font-semibold">9. AI</h1>
            <p className="text-xs text-muted-foreground">
              AI（Claude Code / Codex CLI）と本プロジェクトの統合状態
            </p>
          </header>

          <section className="space-y-3">
            <h2 className="text-base font-semibold">9-1. Playwright MCP（ブラウザ操作 MCP）</h2>

            <div>
              <h3 className="text-sm font-medium">目的</h3>
              <ul className="ml-4 list-disc text-sm">
                <li>ローカル web の DOM・Console・操作を AI から扱う</li>
                <li>通常 Chrome タブ（ログイン状態・拡張保持）に接続する</li>
                <li>操作シーケンスから Playwright テストコード生成の土台にする</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium">構成要素</h3>
              <ul className="ml-4 list-disc text-sm">
                <li>
                  Playwright MCP server: <code>npx @playwright/mcp@latest --extension</code>
                </li>
                <li>
                  Chrome 拡張: <code>Playwright MCP Bridge</code>（Microsoft 公式）
                </li>
                <li>
                  token: <code>PLAYWRIGHT_MCP_EXTENSION_TOKEN</code>（拡張ごと発行・マシン固有・
                  terminal で <code>export</code> して継承）
                </li>
                <li>
                  AI クライアント設定: <code>.mcp.json</code> / <code>.codex/config.toml</code>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium">接続フロー</h3>
              <ol className="ml-4 list-decimal text-sm">
                <li>IDE から launch.json で dev server を起動（Vite + functions）</li>
                <li>
                  別 terminal で <code>export PLAYWRIGHT_MCP_EXTENSION_TOKEN=&lt;値&gt;</code>
                </li>
                <li>同 terminal で AI クライアント起動 → env 継承</li>
                <li>AI が MCP server を起動 → 拡張と接続</li>
                <li>拡張でタブ選択 → 以降そのタブを操作</li>
              </ol>
            </div>

            <div>
              <h3 className="text-sm font-medium">制約事項</h3>
              <ul className="ml-4 list-disc text-sm">
                <li>AI クライアントは token を export 済みの terminal から起動する</li>
                <li>token はマシン固有のためチームで共有しない</li>
                <li>
                  token 永続化（<code>~/.zshrc</code> 等への追記）は各開発者の運用に委ねる
                </li>
                <li>
                  Chrome 136 以降のデフォルト profile CDP 制限は本方式（拡張ブリッジ）の影響外
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium">参照</h3>
              <ul className="ml-4 list-disc text-sm">
                <li>
                  設計本体: <code>docs/overview/9.ai/9-1.playwright-mcp/overview.md</code>
                </li>
                <li>
                  導入手順: <code>docs/overview/9.ai/plan/9-1.playwright-mcp.md</code>
                </li>
              </ul>
            </div>
          </section>
        </section>
      </CardContent>
    </Card>
  );
}
