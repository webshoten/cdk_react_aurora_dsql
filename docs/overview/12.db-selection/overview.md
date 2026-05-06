# 12. DB選定調査

## サマリー

### 前提
- 比較対象は `Aurora DSQL` と `Aurora MySQL Serverless v2` の2択とする
- 料金比較のリージョンは `ap-northeast-1 (Tokyo)` とする
- 比較容量は `20GB` とする
- 比較条件は `NAT回避（NAT Gateway費 0）` を前提とする
- トラフィック参照値は `rehacul-stg-ct-mysql-primary` の CloudWatch 実績を使う

### 実測（rehacul-stg-ct-mysql-primary）
- 対象DBは `RDS MySQL (db.t3.large)` であり、Aurora Serverless v2 の ACU 実測値は持たない
- 直近60日の平均値は `ReadIOPS 0.28/s`、`WriteIOPS 4.79/s`、合計 `5.07 IO/s` とする
- 直近60日の `CPUUtilization` 平均は `5.57%` とする
- 実測は「低〜中負荷 + スパイクあり」の形状とする

### 東京単価（確認値）
- `Aurora MySQL Serverless v2 (Standard)` は `0.15 USD / ACU-hour` とする
- `Aurora MySQL Storage (Standard)` は `0.12 USD / GB-month` とする
- `Aurora MySQL I/O (Standard)` は `0.24 USD / 100万IO` とする
- `Aurora DSQL Storage` は `0.33 USD / GB-month` とする
- `Aurora DSQL Compute` は `8 USD / 100万DPU` とする

### 20GB・NAT回避の月額比較（USD）
- `Aurora MySQL Serverless v2 (Standard)`:
  - 式: `ACU平均 * 730 * 0.15 + (20 * 0.12) + I/O`
  - I/Oは `5.07 IO/s` 実績を使うと月 `約13.14M IO`、`約3.15 USD`
  - 合計目安:
    - `ACU平均 0.1` の場合 `約16.50 USD/月`
    - `ACU平均 0.2` の場合 `約27.45 USD/月`
    - `ACU平均 0.3` の場合 `約38.40 USD/月`
- `Aurora DSQL`:
  - 式: `(20 * 0.33) + DPU課金`
  - 固定部は `6.60 USD/月`
  - DPU課金はアクセス量依存で上積みされる

### 判断軸
- `NATあり` の比較軸（NAT固定費によるDSQL優位）は、`NAT回避` 前提では適用しない
- `NAT回避` 時は `Aurora MySQL Serverless v2` のコスト競争力が上がる
- 現在の実測負荷では、`ACU平均` をどこに置くかで優劣が分かれる
- `ACU平均 0.2` 近辺までは `Aurora MySQL Serverless v2` が有力候補となる

### 暫定結論
- 現時点の設計方針は `Aurora MySQL Serverless v2（NAT回避構成）` を第一候補とする
- 最終確定は、PoC 環境で `ServerlessDatabaseCapacity`（ACU実測）を取得して行う
- ACU実測後、同じ式で `DSQL` と再比較して最終決定する

## 履歴

### 2026-05-03

- DSQL と Aurora MySQL Serverless v2 を比較対象として整理した
- `rehacul-stg` の `stg-ct` 関連DBを確認し、`rehacul-stg-ct-mysql-primary` を実測対象に確定した
- CloudWatch 60日実績（ReadIOPS/WriteIOPS/CPU）を比較入力として採用した
- 東京リージョンの Aurora MySQL Serverless v2 単価（ACU/Storage/I/O）を取得して比較式へ反映した
- NAT回避前提での比較へ切り替え、NAT固定費起点の判断軸を外した
