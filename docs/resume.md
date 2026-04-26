# Resume

## 現在進行中

- `4.frontend / 4-1.data-01` の設計を進行中
- 方針: `urql` で GraphQL 呼び出し、`4-1` では認証なし
- 方針: 型生成は自動watchなし、スクリプト一発実行を採用

## 直近の次アクション

1. `4-1.data-01` の対象クエリと表示項目を確定する（medical-staff）
2. `@pf/web` に `urql` 最小 Provider を導入する
3. 型生成スクリプト（手動実行）を追加する
4. `4-13.maintenance-01` の方式を詰める（CloudFront + Lambda@Edge + bypass cookie）

## メモ

- 認証検証は `4-3.auth-01` で扱う
