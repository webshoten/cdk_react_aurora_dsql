# 4-1. data-01

## 検証対象

- 医療者Web表示（React + GraphQL Lambda）

## 前提（確定）

- `4-1` 段階では認証は扱わない（`auth-01` で別途検証する）
- フロントは `urql` で GraphQL を呼び出す
- 型生成は自動watchしないが、スクリプトで一発実行できる状態にする

## 実装スコープ（4-1）

- `urql Provider` の最小構成を用意する
- `medical-staff` 系データの一覧表示ページを作る（候補: `medicalStaffsByInstitution`）
- 型生成コマンドを `scripts` / `pnpm` コマンドとして追加する（例: `pnpm graphql:gen`）

## スコープ外（4-1ではやらない）

- 認証連携（Amplify UI / Cognito / GraphQL Authorizer）
- 型生成のリアルタイム自動化（`sst dev` 連動 watch）
