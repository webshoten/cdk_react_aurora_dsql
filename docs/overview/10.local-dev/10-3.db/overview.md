# 10-3. DB 参照

## 目的

- migration / seed 実行後に DB 状態を確認する

## 確認対象

- migration 履歴: `public.pf_migration_files`
- seed 投入結果: 対象テーブルの件数・主キー重複有無

## 参照方針

- まずアプリ経由の確認（GraphQL `seedItems` など）を優先
- 必要時のみ SQL で直接確認する

## 参照時の注意

- 本番系データの直接更新は行わない
- 確認目的の SQL は `SELECT` を原則とする
- DDL/DML は runbook に定義された手順がある場合のみ実施する
