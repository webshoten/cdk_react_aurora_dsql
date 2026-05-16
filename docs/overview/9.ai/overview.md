# 9. AI

## 対象

- MCP（Model Context Protocol）
- Skill（Codex skill）

## 現状

- AI 利用は `Codex` / `Claude` を前提とする
- MCP は `awslabs-aws-iac-mcp-server` を利用する（AWS CDK / AWS IaC 操作用）
- Skill は必要に応じて追加し、導入済みスキルをチームで共有する
- Web のローカル DOM 観測は Playwright MCP（拡張ブリッジ方式）を経由する

## 構成

- `9-1.playwright-mcp`: ブラウザ操作 MCP（AI から web の DOM・Console・操作を扱う）

## 導入済みMCP

- `awslabs-aws-iac-mcp-server`
  - 目的: AWS CDK / IaC の参照・操作系タスクを支援する
- `Playwright MCP`（`@playwright/mcp`）
  - 目的: ローカル起動した web（`packages/web`）の DOM・Console・操作を Claude Code / Codex から扱えるようにする

## 導入済みSkill（2026-04-26時点）

- `react-best-practices`
  - 目的: React 実装時の設計/実装判断を標準化する
  - 取得元: `vercel-labs/agent-skills`

## ハーネス

- `Process Guardrails`（運用ガードレール）: AI 実装の進め方を手順として固定し、運用のばらつきを抑える
  - `AGENTS.md` / `CLAUDE.md` を作業時の手順ハーネスとして利用する
  - `docs/overview/8.coding-rules/overview.md` を実装判断の正本として準拠する
  - AI 実装支援は `Codex` / `Claude` を前提にプロンプト・手順を記述する
  - 実装前に、対象タスクで使う MCP / Skill を明示する
  - 公式ドキュメントと矛盾する場合は、公式情報を優先する
  - 新規 Skill 導入時は本章に目的と取得元を追記する
- `Quality Gate(s)`（品質ゲート）: AI 作業後の検証を `pnpm qa` に集約し、品質判定を機械実行で統一する
  - `QAの概要`: `pnpm qa` を単一入口として実行し、失敗時は完了扱いにしない。新規指摘は同一タスク内で解消し、例外時は `docs/operations/qa-issues.md` の台帳ルール（理由・チケットID・期限）に従う
  - `コマンド別説明`
    - `pnpm qa:static`: 静的解析（例: semgrep）を実行する
    - `pnpm qa:base`: 常時必須の最小検証（lint/typecheck など）を実行する
    - `pnpm qa:frontend`: フロントエンド観点の検証を実行する
    - `pnpm qa:backend`: バックエンド観点の検証を実行する
    - `pnpm qa:infra`: IaC/CDK 観点の検証（`CDK_SHARED_ENV` 必須、`CDK_NAG=1` で `cdk synth --no-lookups` + `cdk-nag`）を実行する
    - `pnpm qa:security`: セキュリティ観点の検証を実行する
    - `pnpm qa:full`: 全観点の統合検証を実行する

## 決定ログ

- 2026-04-26: `9.ai` 章を追加（MCP / Skill の管理方針を明文化）
- 2026-04-26: 利用MCPを `awslabs-aws-iac-mcp-server` として明記
- 2026-04-26: `react-best-practices` を導入
- 2026-04-26: AI 利用前提として `Codex` / `Claude` を明記
- 2026-05-12: AI コード変更後の必須検証として観点別 `qa:*` と統合 `pnpm qa` 運用を追加
- 2026-05-14: `qa:infra` は `cdk-nag` を組み込んだ CDK synth で実行する方針を追加
- 2026-05-15: Playwright MCP を導入（拡張ブリッジ方式 `@playwright/mcp` + Chrome 拡張 `Playwright Extension`、設計書 `docs/overview/9.ai/9-1.playwright-mcp/overview.md`）
- 2026-05-15: token は env ファイル経由ではなく terminal の `export` で各開発者が個別に設定する方針に確定（launch.json の dev server は token に関与しない）
