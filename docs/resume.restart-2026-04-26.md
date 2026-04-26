# Resume (Restart用) - 2026-04-26

## 現在の要点

- `4-1.data-01` を実装済み（`medicalStaffsByInstitution` 一覧 + 「データ投入（冪等）」ボタン）
- フロントは `urql` + `shadcn/ui` + `react-router`（layout + nested routes）へ移行済み
- フロント構成は vertical slice（ドメイン分割）へ変更済み
- `react-best-practices` skill を導入済み（Codex再起動で有効化）

## 今回の主要変更

1. Backend / Core
- `medical_staffs` テーブル追加（migration + seed）
- `@pf/core` に `medical-staff` ドメイン追加（`index.ts` 入口、`repository/types/demo-data` 分割）
- `SELECT` / upsert は Drizzle で実装
- GraphQL に以下を追加
  - query: `medicalStaffsByInstitution(institutionCode: String!)`
  - mutation: `seedMedicalStaffs`（冪等 upsert）

2. Frontend
- `@pf/web` に `urql Provider` 導入
- `shadcn/ui` ベースの UI（Button/Card）導入
- 左サイドナビ + 右コンテンツの layout を導入
- `react-router-dom` で nested routes 化
  - `/frontend/4-1.data-01`
  - `/frontend/4-2.data-02`（placeholder）
  - `/frontend/4-3.auth-01`（placeholder）
- vertical slice 構成
  - `domains/frontend-shell/*`（layout / nav / config context）
  - `domains/frontend-data-01/*`（page / query hook / mutation hook）

3. Docs
- `docs/overview/4.frontend/4-1.data-01/overview.md` 更新
  - 左ナビ、shadcn、layout+nested routes、冪等投入を明記
- `docs/overview/8.coding-rules/overview.md` 更新
  - 原則 Drizzle で SQL 構築
  - フロントは vertical slice（domain + hooks/context 同居）
- `docs/overview/9.ai/overview.md` 新設
  - MCP/Skill 運用方針を記載（現状: `awslabs-aws-iac-mcp-server`）
- `docs/overview.md` に `9. AI` 章リンク追加

## 検証結果

- `pnpm lint` : pass
- `pnpm --filter @pf/core typecheck` : pass
- `pnpm --filter @pf/functions test` : pass
- `pnpm --filter @pf/web build` : pass

## 導入済み Skill（再起動後有効）

- `react-best-practices`
  - path: `/Users/user/.codex/skills/react-best-practices`
  - source: `vercel-labs/agent-skills` の `skills/react-best-practices`

## 次アクション（再起動後）

1. Skill有効化確認（`react-best-practices` が選択可能か）
2. `4-2.data-02` / `4-3.auth-01` の実体ページ化（現在は placeholder）
3. 必要なら migration 実行で `medical_staffs` を環境反映
