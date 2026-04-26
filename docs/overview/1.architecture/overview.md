# 1. 全体アーキテクチャ

## 対象

- AWS CDK 構成全体
- stack 間の責務分離
- shared contract の取り扱い

## 現状

- IaC: AWS CDK + TypeScript
- stack 構成:
  - `SharedStack`
  - `DbStack`
  - `ApiStack`
  - `WebStack`
- `SharedStack` が SSM Parameter Store に最小 contract を出力し、app stack が参照する

## 決定ログ

- YYYY-MM-DD: (ここに決定事項を追記)
