# 2-4. OpsStack

## 対象

- `OpsStack`
- migration 実行基盤

## 責務

- migration / seed 実行に必要な運用基盤を提供する
- 運用 CLI から参照される実行情報を公開する

## 管理リソース

- `AWS::S3::Bucket`（migration SQL zip 保管）
- `AWS::Lambda::Function`（MigrationRunner）
- `AWS::Logs::LogGroup`（MigrationRunner ログ）

## 決定ログ

- YYYY-MM-DD: (ここに決定事項を追記)
