# 9. AI

## 対象

- MCP（Model Context Protocol）
- Skill（Codex skill）

## 現状

- AI 利用は `Codex` / `Claude` を前提とする
- MCP は `awslabs-aws-iac-mcp-server` を利用する（AWS CDK / AWS IaC 操作用）
- Skill は必要に応じて追加し、導入済みスキルをチームで共有する

## 導入済みMCP（2026-04-26時点）

- `awslabs-aws-iac-mcp-server`
  - 目的: AWS CDK / IaC の参照・操作系タスクを支援する

## 導入済みSkill（2026-04-26時点）

- `react-best-practices`
  - 目的: React 実装時の設計/実装判断を標準化する
  - 取得元: `vercel-labs/agent-skills`

## 運用方針

- AI 実装支援は `Codex` / `Claude` を前提にプロンプト・手順を記述する
- 実装前に、対象タスクで使う MCP / Skill を明示する
- 公式ドキュメントと矛盾する場合は、公式情報を優先する
- 新規 Skill 導入時は本章に目的と取得元を追記する

## 決定ログ

- 2026-04-26: `9.ai` 章を追加（MCP / Skill の管理方針を明文化）
- 2026-04-26: 利用MCPを `awslabs-aws-iac-mcp-server` として明記
- 2026-04-26: `react-best-practices` を導入
- 2026-04-26: AI 利用前提として `Codex` / `Claude` を明記
