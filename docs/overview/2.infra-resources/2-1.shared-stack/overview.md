# 2-1. SharedStack

## 対象

- `SharedStack`
- 環境共通の基盤情報

## 責務

- システム全体で共有する基盤情報・共通前提を管理する
- app stack が参照する共通値を提供する

## 管理リソース

- `AWS::SSM::Parameter`（shared contract / shared env）

## 決定ログ

- 2026-04-28: 決定ログのプレースホルダを廃止し、日付付き追記方式へ統一
