# Resume (Restart用) - 2026-04-26 / urql typed wrapper

## 目的（次にやること）

- `@pf/web` の GraphQL 呼び出しを、`../rehacul` と同系統の
  - `urql client` ラップ
  - codegen 生成型（`TypedDocumentNode`）利用
 へ寄せる

## 現在の到達点（実装済み）

1. フロント構成の再編
- `packages/web/src` を `app / domains / shared` に再編
- ルーティングを `app/router.tsx` に集約
- 各ページを `domains/*/route.tsx` で分離

2. Provider 構成
- `urql` + `WebConfigProvider` を `app/providers.tsx` に集約
- runtime config 解決は `app/providers/runtime-config.ts`

3. import ルール
- `@/` エイリアスを導入（`src` 基準）
  - `packages/web/tsconfig.json`
  - `packages/web/vite.config.ts`

4. サイドバー
- `4.frontend` の全項目（`4-1` 〜 `4-13`）を表示
- 未実装ページは非リンク表示

5. ドキュメント反映
- `docs/overview/4.frontend/4-1.data-01/overview.md`
  - 現構成の実装メモを追記
  - 「urql client + codegen生成型ラップ」は次段設計（未実装）として追記
- `docs/overview/8.coding-rules/overview.md`
  - React実装時は `react-best-practices` Skill 参照を明記
- `docs/overview/9.ai/overview.md`
  - MCP: `awslabs-aws-iac-mcp-server`
  - AI前提: `Codex` / `Claude`

## 未実装（これから）

1. GraphQL codegen の対象整理
- 現在 `codegen.ts` は `src/graphql/**/*.graphql` を参照している
- 実ファイルは `src/domains/**/graphql/*.graphql` 配下
- `documents` 設定を現構成に合わせる

2. 生成物ベース呼び出しへ移行
- 生文字列クエリを廃止
- 生成済みドキュメント（`src/gql/*`）を hooks で利用

3. client ラッパー化
- `createClient` 初期化を専用モジュールへ分離（`app/providers` 配下想定）
- ページ/ドメイン側はラッパー経由のみ利用

4. 検証
- `pnpm --filter @pf/web graphql:gen`
- `pnpm --filter @pf/web build`

## 着手時の注意

- 今回は「設計のみ」で、上記 typed wrapper は未実装
- `lazy + Suspense` は現時点では導入しない（必要時に個別適用）

## 参照ファイル

- `packages/web/codegen.ts`
- `packages/web/src/app/providers.tsx`
- `packages/web/src/domains/frontend-data-01/hooks/use-medical-staffs-by-institution-query.ts`
- `packages/web/src/domains/frontend-data-01/hooks/use-seed-medical-staffs-mutation.ts`
- `docs/overview/4.frontend/4-1.data-01/overview.md`
