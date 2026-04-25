# DB 選定メモ（DSQL 採用方針）

cdk_pf の DB として **Aurora DSQL** を採用する方針。決定の背景、構成変更案、未決事項を記録する。
途中で会話が切れた場合、このファイルから再開できるように書く。

## 1. 背景

- 元プロジェクト `../cdk_serverless` は Aurora MySQL + VPC + NAT Gateway + Bastion 構成
- cdk_pf は「シンプル化」目的で立ち上げた SPA + Lambda の最小構成
- DB を後付けしたいが「VPC + NAT」「コネクションプール」「DBA 運用」を抱えたくない
- **完全サーバーレス DB** を探した結果、**Aurora DSQL** を有力候補に選定

## 2. 検討した選択肢

| 候補 | 互換 | VPC | 谷で課金 | 備考 |
|---|---|---|---|---|
| **Aurora DSQL** ★ | PostgreSQL | **不要** | **ゼロ** | 完全サーバーレス、IAM 認証 |
| Aurora Serverless v2 | MySQL/PG | 必要 | 0 ACU 可（復帰 ~15s） | フル機能、ACU 課金 |
| DynamoDB | NoSQL（独自API） | 不要 | ゼロ | RDS 体験と違いすぎ |
| Aurora Serverless v1 | MySQL/PG | 必要 | ゼロ | 廃止予定 |

→ cdk_pf（新規・小〜中規模・読めない谷あり）には **DSQL が最適**。

参考: rehacul（既存 MySQL アプリ）の場合は **Aurora Serverless v2 MySQL** が現実解
（DSQL は MySQL 非対応 + 移行コスト + 機能制約で不向き）。

## 3. DSQL の主要制約（採用時の留意点）

### 使えない PG 機能
- 外部キー制約（`FOREIGN KEY`）
- トリガー / ストアドプロシージャ
- マテリアライズドビュー（シンプル VIEW のみ可）
- SEQUENCE（`IDENTITY` 列で代替）
- LISTEN/NOTIFY
- PG 拡張ほぼ全部（pgvector, pg_trgm, postgis, aws_s3 等）
- テンポラリテーブル制限、UNLOGGED テーブル不可、テーブル継承不可

### トランザクション
- **SERIALIZABLE 強制**（他の分離レベル指定不可）
- **オプティミスティック並行制御**: 競合時 `SERIALIZATION_FAILURE` → アプリでリトライ必須
- 最大時間 ~5 分、修正行数上限あり、長時間 read 不可

### 接続/認証
- **IAM 認証のみ**（パスワード認証なし）
- 接続トークン 15 分有効
- コネクションプーリング 推奨されない

### DBA 運用
- VACUUM 自動のみ、手動 EXPLAIN ANALYZE 一部制限
- 大半の DBA ツール 未対応

### S3 連携
- `aws_s3` 拡張 不可 → 退避バッチは Lambda/ECS で自前実装
- DMS source 対応は要最新確認

## 4. 価格メモ（東京リージョン目安、2026-04 時点・概算）

### Aurora DSQL
- DPU 課金（処理量）: $8 / million DPU 程度
- ストレージ: $0.33/GB/月（シングル） / $0.81/GB/月（マルチリージョン）
- アイドル時 コンピュートゼロ、接続料ゼロ

### Aurora Serverless v2（比較用）
- ACU 時間: 約 $0.20/ACU時（PG, 東京）
- 0.5 ACU 常時 → 約 $72/月
- ストレージ $0.10/GB/月、I/O 100万 req あたり $0.20

### シナリオ別
| | DSQL | Serverless v2 |
|---|---|---|
| 開発環境 | $0〜数ドル | $30〜70 |
| 本番低負荷 | $5〜20 | $70〜150 |
| 常時 8 ACU 相当 | DPU 次第（高め） | $1,152（一定） |

→ **谷あり ＋ 予測不能なスパイク** = DSQL 圧倒的有利。
→ **24/7 常時高負荷** = Serverless v2 の方が予測可能・安く済む。

cdk_pf は前者寄り想定 → DSQL 採用。

## 5. 公式 FAQ で確認した事実

- **DSQL の MySQL 版 提供なし**（公式 FAQ で "No"）
- 2026-04 時点で 14 リージョン展開、PostgreSQL 互換のみ
- MySQL/Oracle 等の他エンジン対応 ロードマップ情報なし

ソース:
- https://aws.amazon.com/rds/aurora/dsql/faqs/
- https://aws.amazon.com/about-aws/whats-new/2026/02/amazon-aurora-mysql-312-available/

## 6. 構成変更案（採用時）

### Before
```
SharedStack 群:
  pf-${sharedEnv}-shared       (将来の共有基盤用 placeholder)

AppStack 群:
  pf-${sharedEnv}-${stage}-api (HttpApi + Lambda)
  pf-${sharedEnv}-${stage}-web (S3 + CloudFront)
```

### After
```
SharedStack 群（純粋に共有すべきもののみ）:
  pf-${sharedEnv}-shared       (将来: HostedZone, ACM, グローバル KMS 等)
  ※ 現時点では placeholder のみ

AppStack 群（stage ごと、破棄前提）:
  pf-${sharedEnv}-${stage}-db  (DSQL クラスタ ★新規)
  pf-${sharedEnv}-${stage}-api (HttpApi + Lambda、VPC 外、IAM で DSQL 接続)
  pf-${sharedEnv}-${stage}-web (S3 + CloudFront)
```

### 削れるもの
- VPC / NAT Gateway / Subnet / Security Group / Bastion
- VPC 関連 SSM パラメータ
- Lambda の VpcConfig（VPC 外配置で ENI 不要、コールドスタート短縮）

### 増えるもの
- DSQL クラスタ Construct（`aws-cdk-lib/aws-dsql` または L1 Cfn）
- Lambda 実行ロールに `dsql:DbConnect` 等
- DSQL endpoint を Lambda 環境変数注入
- 接続トークン取得 helper（`@aws-sdk/dsql-signer` 利用）
- drizzle/pg ORM 等（必要に応じ）

## 7. 未決事項（次回以降に決める）

### A. SharedStack の扱い
1. 完全削除（必要時に復活）
2. 空の placeholder スタックを残す（命名規約と CLI のため）
3. 構造（フォルダ）だけ残し、内容ファイルは削除

### B. DSQL クラスタの配置単位
1. **stage ごと**（開発者ごとデータ分離、推奨）
2. shared（環境ごと1つ、stage 間共有）

### C. ORM
1. **drizzle ORM**（型安全 SQL、スキーマ管理、マイグレーション）
2. 生 SQL（`pg` ライブラリ + `@aws-sdk/dsql-signer`）

### D. マイグレーション戦略
1. **drizzle-kit**（`drizzle-kit migrate`）
2. db-init Lambda で初期化
3. 手動（psql + IAM トークン）

### E. リトライロジック
- `SERIALIZATION_FAILURE` のリトライ helper を共通化する場所
- functions パッケージ内 `src/shared/db.ts` 等に置くか

## 8. 想定される実装の進め方（次セッション）

1. 上記未決事項 A〜E を決定
2. `packages/infra/lib/stacks/shared/shared-stack.ts` を placeholder 化
3. `packages/infra/lib/stacks/app/db-stack.ts` 新規作成（DSQL クラスタ）
4. `packages/infra/lib/constructs/app/db/index.ts` 新規（DSQL Construct）
5. `bin/cdk.ts` 更新（SharedStack placeholder 化、DbStack 追加、依存関係）
6. ApiStack 更新（DSQL endpoint を Lambda 環境変数に、IAM ポリシー）
7. `packages/functions/src/shared/db.ts` 新規（DSQL 接続 helper）
8. `packages/functions/package.json` に `@aws-sdk/dsql-signer` `pg` `drizzle-orm` 追加
9. サンプル handler を hello → DB クエリ版に更新
10. README 更新

## 9. 補足: 既存 cdk_pf との相性

- cdk_pf は新規プロジェクトなので、DSQL 制約に最初から合わせて設計可能
- 「シンプル化」目的と DSQL の「VPC 不要・サーバーレス・IAM 認証」が完全一致
- NAT Gateway 削除だけで月 $35+ 削減 → 開発環境は実質ゼロコストに近づく
