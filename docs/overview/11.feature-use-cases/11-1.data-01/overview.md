# 11-1. data-01

## 検証対象

- 医療者Web表示（React + GraphQL Lambda）

## 前提（確定）

- `11-1` 段階では認証は扱わない（`auth-01` で別途検証する）
- フロントは `urql` で GraphQL を呼び出す
- 型生成は自動watchせず、`pnpm graphql:build` で一発実行する

## 実装スコープ（11-1）

- `urql Provider` の最小構成を利用する
- 画面は左サイドナビ + 右コンテンツの2カラム構成（`11-1.data-01` を選択状態）を利用する
- ルーティングは `react-router-dom` の `layout + nested routes` 構成を利用する
- `medical-staff` 系データの一覧表示ページ（`medicalStaffsByInstitution`）を利用する
- ページの「ランダム追加」ボタンから `addRandomMedicalStaff` mutation を呼び出す
- ページの「全削除」ボタンから `clearMedicalStaffsByInstitution` mutation を呼び出す
- UI は `shadcn/ui` コンポーネントを利用する
- 型生成コマンドは `pnpm graphql:build` を利用する

## 実装メモ（2026-04-26 追記）

- フロントのディレクトリは `app / domains / shared` 構成とする
- ルーティングは `app/router.tsx` に集約し、各検証ページは `domains/*/route.tsx` から `RouteObject` を提供する
- `urql Provider` は `app/providers/urql-provider.tsx` を利用する
- runtime 設定解決は `packages/web/src/app/config/runtime-config.ts` を利用する
- import は `@/` エイリアス（`src` 基準）を利用する
- サイドバーは `1` 〜 `11` の章を表示し、`11.feature-use-cases` のみ開閉可能なアコーディオンとして子項目（`11-1`〜`11-13`）を表示する
- `urql client` 初期化は `app/providers/graphql-client.ts` に分離し、`createClient` の直接利用を集約する
- GraphQL 型は `Pothos schema` から `packages/graphql` へ生成する
  - `pnpm graphql:extract` で `packages/graphql/schema.graphql` を更新
  - `pnpm graphql:genql` で `packages/graphql/genql/*` を更新
- hooks は `@pf/graphql/urql` の `useTypedQuery` / `useTypedMutation` を利用し、生文字列クエリ/ミューテーションは使用しない

## 対象クエリと表示項目（11-1確定）

- query: `medicalStaffsByInstitution(institutionCode: String!)`
- mutation: `addRandomMedicalStaff(institutionCode: String!)`（ランダムな1件を追加）
- mutation: `clearMedicalStaffsByInstitution(institutionCode: String!)`（対象 institution の全件削除）
- 一覧表示項目: `staffCode`, `name`, `profession`, `institutionCode`

## スコープ外（11-1ではやらない）

- 認証連携（Amplify UI / Cognito / GraphQL Authorizer）
- 型生成のリアルタイム自動化（`sst dev` 連動 watch）
- 重いページに対する `lazy + Suspense` の導入（必要性が出た時点で個別適用）
