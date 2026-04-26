# 4-1. data-01

## 検証対象

- 医療者Web表示（React + GraphQL Lambda）

## 前提（確定）

- `4-1` 段階では認証は扱わない（`auth-01` で別途検証する）
- フロントは `urql` で GraphQL を呼び出す
- 型生成は自動watchしないが、スクリプトで一発実行できる状態にする

## 実装スコープ（4-1）

- `urql Provider` の最小構成を用意する
- 画面は左サイドナビ + 右コンテンツの2カラム構成にする（4-1 は `4-1.data-01` を選択状態で表示）
- ルーティングは `react-router-dom` を利用し、`layout + nested routes` で構成する
- `medical-staff` 系データの一覧表示ページを作る（`medicalStaffsByInstitution`）
- ページに「データ投入（冪等）」ボタンを用意し、`seedMedicalStaffs` mutation（upsert）を呼び出す
- UI は `shadcn/ui` コンポーネントを利用する
- 型生成コマンドを `scripts` / `pnpm` コマンドとして追加する（例: `pnpm graphql:gen`）

## 実装メモ（2026-04-26 追記）

- フロントのディレクトリは `app / domains / shared` 構成とする
- ルーティングは `app/router.tsx` に集約し、各検証ページは `domains/*/route.tsx` から `RouteObject` を提供する
- `Provider` 初期化（`urql` / `WebConfigProvider`）は `app/providers.tsx` に集約する
- import は `@/` エイリアス（`src` 基準）を利用する
- サイドバーは `4.frontend` の全項目（`4-1`〜`4-13`）を表示し、未実装ページは非リンク表示にする

## 次段設計メモ（未実装）

- `urql Provider` は `client` 初期化を専用モジュールでラップし、画面側からは直接 `createClient` を触らない構成にする
- GraphQL は `.graphql` ファイルをソースにして codegen を実行し、生成型（`TypedDocumentNode`）を利用する
- query / mutation hooks は生文字列ではなく、生成済みドキュメントを受け取るラッパー経由で呼び出す
- 配置方針
  - GraphQL定義: `domains/*/graphql/*.graphql`
  - 生成物: `src/gql/*`
  - clientラッパー: `app/providers` 配下
- 目的
  - 型安全性の担保（変数/レスポンスの型ズレ防止）
  - API呼び出し方式の統一（`../rehacul` と同系統の運用）

## 対象クエリと表示項目（4-1確定）

- query: `medicalStaffsByInstitution(institutionCode: String!)`
- mutation: `seedMedicalStaffs`（デモデータ投入、`ON CONFLICT` で冪等）
- 一覧表示項目: `staffCode`, `name`, `profession`, `institutionCode`

## スコープ外（4-1ではやらない）

- 認証連携（Amplify UI / Cognito / GraphQL Authorizer）
- 型生成のリアルタイム自動化（`sst dev` 連動 watch）
- 重いページに対する `lazy + Suspense` の導入（必要性が出た時点で個別適用）
