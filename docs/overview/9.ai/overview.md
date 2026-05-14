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
- AI がコード変更を行った場合は、完了報告前に `pnpm qa` を必ず実行する
- `pnpm qa` が失敗した場合は、成功扱いで完了報告しない
- `pnpm qa` 系で新規指摘が出た場合は、同一タスク内で解消してから完了報告する
- 例外的に未解消で残す場合は、抑制設定または台帳に理由・チケットID・期限を必ず記載する
- 理由なし抑制（ignore/suppress/skip）の追加は禁止する
- QA指摘の管理ルールは、`docs/operations/qa-issues.md` で運用する
  - 必須項目は `Rule/Check ID`、`対象`、`対応方針`、`理由`、`チケットID`、`期限`、`状態` とする
  - 抑制（suppress/ignore/skip）を追加・変更する場合は、同一タスクで台帳更新を行う
- `pnpm qa` は「AI 作業後の必須検証の単一入口」として運用する
- `pnpm qa` は観点別 QA コマンドを束ねる
  - `pnpm qa:static`: 静的解析（例: semgrep）
  - `pnpm qa:base`: 常時必須の最小検証（lint/typecheck など）
  - `pnpm qa:frontend`: フロントエンド観点チェック
  - `pnpm qa:backend`: バックエンド観点チェック
  - `pnpm qa:infra`: IaC/CDK 観点チェック（`CDK_SHARED_ENV` 必須、`CDK_NAG=1` で `cdk synth --no-lookups` + `cdk-nag`）
  - `pnpm qa:security`: セキュリティ観点チェック
- `pnpm qa` は常時必須 `qa:static` / `qa:base` と、変更対象に応じた `qa:*` を実行する
  - `packages/web` 変更時: `qa:frontend` を追加実行する
  - `packages/functions` または `packages/core` 変更時: `qa:backend` を追加実行する
  - `packages/infra` 変更時: `qa:infra` を追加実行する
  - 認証/認可/秘密情報/IAM/ネットワーク変更時: `qa:security` を追加実行する
  - 大きな変更・統合確認時: `qa:full`（全観点実行）を実行する
- AI は上記コマンド結果を解釈して修正方針を提示する

## 決定ログ

- 2026-04-26: `9.ai` 章を追加（MCP / Skill の管理方針を明文化）
- 2026-04-26: 利用MCPを `awslabs-aws-iac-mcp-server` として明記
- 2026-04-26: `react-best-practices` を導入
- 2026-04-26: AI 利用前提として `Codex` / `Claude` を明記
- 2026-05-12: AI コード変更後の必須検証として観点別 `qa:*` と統合 `pnpm qa` 運用を追加
- 2026-05-14: `qa:infra` は `cdk-nag` を組み込んだ CDK synth で実行する方針を追加
