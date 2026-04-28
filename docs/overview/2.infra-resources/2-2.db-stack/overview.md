# 2-2. DbStack

## 対象

- `DbStack`
- Aurora DSQL

## 責務

- stage 単位のデータ基盤を提供する
- app 層の DB 参照元を提供する

## 管理リソース

- `AWS::DSQL::Cluster`（Aurora DSQL）

## 決定ログ

- 2026-04-28: 決定ログのプレースホルダを廃止し、日付付き追記方式へ統一
