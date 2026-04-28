# Overview

## 目的

- 本ファイルは `docs/overview` 全体の索引と読み順を定義する
- 詳細仕様は各章の `overview.md` に集約し、ここには要点のみを置く

## 読み方

1. 全体像は `1 -> 4 -> 11` の順で把握する
2. 実装ルールは `8` を正本とする
3. AI 利用方針は `9` を正本とする
4. 未確定事項は `7` で管理する

## 章一覧

- [1. 全体アーキテクチャ](./overview/1.architecture/overview.md)
- [2. インフラリソース](./overview/2.infra-resources/overview.md)
- [3. バックエンド](./overview/3.backend/overview.md)
- [4. フロントエンド](./overview/4.frontend/overview.md)
- [5. CI/CD](./overview/5.ci-cd/overview.md)
- [6. デプロイ運用](./overview/6.deployment-operations/overview.md)
- [7. 未決事項](./overview/7.open-issues/overview.md)
- [8. コーディングルール](./overview/8.coding-rules/overview.md)
- [9. AI](./overview/9.ai/overview.md)
- [10. ローカル開発](./overview/10.local-dev/overview.md)
- [11. 機能ユースケース (feature-use-cases)](./overview/11.feature-use-cases/overview.md)

## 現在の前提（サマリ）

- IaC は AWS CDK + TypeScript
- stack は `shared` 層と `app` 層で分離
- API は GraphQL（`/graphql`）
- Web は React + Vite、runtime 設定は `config.js` で注入
- AI 利用は `Codex` / `Claude` 前提
- MCP は `awslabs-aws-iac-mcp-server`、Skill は `react-best-practices` を利用

## ドキュメント運用ルール

- `overview.md`: 確定仕様のみを記載
- `plan/`: 検討中メモを記載
- 日付付きの決定ログを残し、`TODO` / `YYYY-MM-DD` のプレースホルダは残さない

## 更新ログ

- 2026-04-28: `docs/overview` 全体の索引形式に再整理し、章別参照導線を統一
