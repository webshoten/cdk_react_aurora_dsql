# cdk-pf

シンプル SPA + Lambda 環境（CDK）。

## 構成

```
cdk_pf/
├── packages/
│   ├── infra/      # CDK
│   │   └── lib/
│   │       ├── stacks/{shared,app}/       # スタック定義（共有 / アプリ）
│   │       └── constructs/app/            # 構成要素
│   ├── functions/  # Lambda handlers + ローカル開発(tsx)
│   └── web/        # Vite + React 19 SPA
└── scripts/        # CDK 操作 CLI (TypeScript)
    ├── cdk.ts          # エントリ（commander で subcommand 登録のみ）
    ├── commands/       # deploy / deploy-shared / diff / destroy / destroy-shared
    └── lib/            # options / run / cdk-cli / web-build
```

### スタック

- **SharedStack** `pf-${sharedEnv}-shared`（環境ごと1つ・長命）
  - 今は placeholder のみ
  - 将来の Hosted Zone / ACM / KMS など共有基盤の受け口
- **DbStack** `pf-${sharedEnv}-${stage}-db`（stage ごと・破棄前提）
  - Aurora DSQL クラスタ
- **ApiStack** `pf-${sharedEnv}-${stage}-api`（stage ごと・破棄前提）
  - HTTP API + Lambda (Node.js 24.x, NodejsFunction esbuild bundle)
  - Lambda は VPC 非参加、IAM で DSQL 接続
- **WebStack** `pf-${sharedEnv}-${stage}-web`
  - S3 + CloudFront (OAC) + BucketDeployment

## 前提

- asdf（`.tool-versions` で固定）
  - nodejs 24.15.0
  - pnpm 9.15.9
- AWS CLI / CDK ブートストラップ済み (`cdk bootstrap`)
- Docker（NodejsFunction バンドル時）

## セットアップ

```bash
asdf install        # .tool-versions 通り インストール
pnpm install
```

別バージョンへ変更時 `.tool-versions` 編集 → `asdf install`。

## デプロイ

CLI: `tsx scripts/cdk.ts <subcommand>`（`pnpm cdk:*` 経由 推奨）

オプション（全 subcommand 共通）:
- `--shared <env>` 必須
- `--stage <stage>` 既定: `whoami`
- `--profile <name>` 既定: `AWS_PROFILE` env → `default`
- `-- <cdk-args...>` 以降は cdk CLI へそのまま渡す

```bash
# 1. SharedStack（placeholder。最初の1回 + 共有変更時）
pnpm cdk:deploy:shared --shared dev
pnpm cdk:deploy:shared --shared dev --profile my-aws

# 2. AppStack（db + api + web）
pnpm cdk:deploy --shared dev
pnpm cdk:deploy --shared dev --profile my-aws
pnpm cdk:deploy --shared dev --stage alice --profile my-aws

# ヘルプ
pnpm exec tsx scripts/cdk.ts --help
pnpm exec tsx scripts/cdk.ts deploy --help
```

### デプロイ後に実行すること

- DB 変更を反映するため、デプロイ後に migration を実行する

```bash
pnpm migrate --shared dev --stage alice --profile my-aws
```

- 認証検証ユーザーを作成する場合は user 作成 script を実行する

```bash
pnpm user:create --shared <sharedEnv> --stage <stage> --username <username> --password <password> --email <email> --profile <awsProfile>
```

## 差分確認

```bash
pnpm cdk:diff --shared dev
```

## 破棄

```bash
pnpm cdk:destroy --shared dev
pnpm cdk:destroy --shared dev --stage alice
pnpm cdk:destroy:shared --shared dev
```

## GraphQL 型生成（genql）

- Pothos schema の変更後は `genql` 型生成を更新する
- 通常は以下の一括コマンドを使う

```bash
pnpm graphql:build
```

- 個別実行する場合

```bash
pnpm graphql:extract
pnpm graphql:genql
```

## ローカル開発

```bash
pnpm dev:functions    # http://localhost:4000/graphql
pnpm dev:web          # http://localhost:5173
```

フロントエンドは `/config.js` から API URL を読む。ローカルでは未設定なので、
必要なら `packages/web/public/config.js` 相当を用意するか、app 側の deploy 後に確認する。

### VSCode launch.json でローカルデバッグ

- `.vscode/launch.json` の `local-dev: web+functions` を使う
- 起動前に `local-dev:resolve-env` が走り、AWS 環境値を `.vscode/.local-dev.env` に解決する
- 1つの起動構成で `@pf/functions` と `@pf/web` を並列起動できる
- 固定値（`DSQL_DATABASE` / `DSQL_DB_USER` / `DSQL_PORT` / `DSQL_REGION` / `PORT`）は launch 側で渡す
