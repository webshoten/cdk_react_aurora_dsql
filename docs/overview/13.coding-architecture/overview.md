# 13. コーディングアーキテクチャ

## 対象

- フロントエンドとバックエンドの共通アーキテクチャ方針
- I/F 層とドメイン層の責務分離

## 方針

- I/F 層は薄く保ち、ビジネスロジックを持たせない
- ドメイン層に仕様・状態遷移・検証・永続化の責務を集約する
- スキーマ定義はドメインごとに分割し、I/F 層で集約する
- backend は `domains/graphql` を統合専用層とし、業務実装は `domains/*` 配下へ集約する
- infra の Stack はリソース種別ではなく機能責務で分割する（vertical）

## レイヤ責務

- `I/F 層`: 入出力の公開面を担う
  - frontend: route / page / UI の接続点
  - backend: handler / GraphQL 集約（schema compose, context, server）の接続点
  - 変換・配線に限定し、業務判断ロジックは持たない
- `ドメイン層`: 機能仕様の本体を担う
  - 入力検証、ユースケース、永続化、イベント処理を保持する
  - 他ドメインへの依存は最小化し、共通基盤は `shared` を経由する

## Packages の責務（概要）

- `packages/functions`: 実行境界の責務
  - Lambda/GraphQL/Authorizer など、リクエストを受けて処理を実行する
  - I/O 配線とユースケース実行を担当し、永続化ロジックは `core` へ委譲する
- `packages/core`: 永続化・共有ドメイン責務
  - DB repository/entity/migration など、実行基盤に依存しない中核ロジックを担う
  - `functions` から利用されるが、`core` から `functions` へは依存しない
- `packages/web`: UI/体験責務
  - 画面表示・入力・状態遷移・API 呼び出し制御を担う
  - 業務判定は backend 契約に沿う最小限に限定する
- `packages/infra`: インフラ定義責務
  - AWS リソース定義と環境差分管理を担う
  - deploy 再実行で収束する冪等な IaC を維持する
- `packages/graphql-schema`: API 契約責務
  - backend schema から生成される型・クライアント契約を管理する
  - web/functions 間の型整合を担保する
- `packages/mqtt-schema`: MQTT 契約責務
  - topic/payload の共有仕様を管理する
  - web/functions/infra 間の topic 形式ぶれを防止する

## Backend 目標構成

- `packages/functions/src/domains/graphql/*`: 統合専用
  - `domains/graphql/schema/index.ts`: ドメイン schema の compose のみを担当する
  - `domains/graphql/context.ts`: 共通 context（auth/db/s3 など）の注入のみを担当する
  - `domains/graphql/yoga.ts`: server 起動定義のみを担当する
- `packages/functions/src/domains/<domain>/*`: ドメイン実装本体
  - `schema.ts`: そのドメインの GraphQL 型・field 定義
  - `resolver.ts`: 入出力配線（薄い変換と service 呼び出し）
  - `service.ts`: 業務ロジック本体（検証・ユースケース・永続化呼び出し）
- `packages/functions/src/domains/auth/*`: 認証ドメイン実装
  - `authorizer.ts`: GraphQL 用 Authorizer の検証ロジックを担当する
  - `identity-provider.ts`: Cognito UserPool 操作（作成・削除・パスワード再設定）を担当する
  - `iot-authorizer.ts`: IoT Custom Authorizer の検証ロジックを担当する
- `packages/functions/src/handlers/*`: Lambda エントリポイント（薄い入口）を維持する
- `packages/functions/src/shared/*`: 横断共通（env/logger/error/utility）のみを配置する

## Core 目標構成

- `packages/core/src/domains/<domain>/*`: core 側のドメイン実装本体
  - `entity.ts`: 永続化モデル・型定義
  - `repository.ts`: DB CRUD/検索
  - `index.ts`: ドメイン公開面（export 集約）
- `packages/core/src/shared/db/*`: DB 共通基盤
  - `client.ts`: DSQL client 構成・接続
  - `types.ts`: DB クライアント型定義
- `packages/core/src/shared/migration/*`: migration 共通基盤
  - `env.ts`: migration 実行設定の解決
  - `runner.ts`: migration/seed 実行
- 方針: core は `functions` 依存を持たず、複数実行基盤で共有可能な責務に限定する

## Backend 移行方針

- 既存機能の互換を崩さないため、段階移行で進める
- 第1段階: `domains/realtime` を先行し、`graphql` は compose 専用へ薄くする
- 第2段階: `domains/users` / `domains/images` / `domains/medical-staffs` / `domains/seed` を横展開する
- 第3段階: 旧 `graphql/resolvers/*` と `services/auth/*` の業務実装を撤去し、`domains/*` へ統合する
- 完了条件: `domains/graphql` は compose/context/server のみ、業務ロジックは `domains/*` で閉じる
- 補足: `core` は backend 移行と合わせて `domains/* + shared/db + shared/migration` へ段階再編する

## Frontend TSX 方針

- `route.tsx`: ルーティング宣言のみを担う
  - データ取得や業務判断ロジックを持たない
- `pages/*.tsx`: 画面単位の合成に限定する
  - 複数 hook の接続、表示用 state の最小管理、コンポーネント組み立てを行う
  - API 呼び出しの実体や複雑な分岐ロジックは持たない
- `components/*.tsx`: 表示とイベント通知に限定する
  - UI レンダリング、props 受け取り、`onClick` などの通知のみを担う
  - 認証・権限判定・API 実行・ドメイン検証ロジックを持たない
- `hooks/*.ts(x)`: 画面から分離すべき処理を保持する
  - GraphQL query/mutation 実行、`pause/enabled` 判定、UI 以外の副作用を扱う
  - hook はドメイン単位で配置し、別ドメインへ横断拡散しない

## スキーマ方針

- 各ドメインが自身の schema 定義を持つ
- 集約 schema はドメイン schema を束ねる入口に限定する
- 集約 schema ファイルに個別ドメインの実装ロジックを集約しない
- backend の schema は `domains/*/schema.ts` に分割し、`domains/graphql/schema/index.ts` は compose のみを担当する

## 依存方向

- `I/F -> domain -> shared`
- `domain -> I/F` の逆依存は禁止する
- frontend / backend ともに同じ依存方向ルールを適用する
- backend は `handlers -> domains/graphql -> domains/* -> shared` を基本とする
- functions から core への依存は許可し、core から functions への逆依存は禁止する

## 禁止事項

- I/F 層への業務ロジック集中
- 集約 schema ファイルへのドメイン実装の直接記述
- ドメインをまたぐ重複実装
