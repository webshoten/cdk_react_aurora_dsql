# Resume (Restart用) - 2026-04-26 / urql typed wrapper

## 今回完了したこと

1. `packages/graphql` 新設
- `packages/graphql/schema.graphql`
- `packages/graphql/genql/*`（生成物）
- `packages/graphql/urql.ts`（typed wrapper）
- `packages/graphql/index.ts`

2. 生成パイプライン追加
- `packages/functions/src/graphql/extract.ts`
  - Pothos schema から `packages/graphql/schema.graphql` を出力
- root scripts
  - `pnpm graphql:extract`
  - `pnpm graphql:genql`
  - `pnpm graphql:build`（extract + genql）

3. `@pf/web` 側の移行（4-1）
- `@pf/web` に `@pf/graphql` を導入
- 4-1の hooks を `@pf/graphql/urql` ベースへ移行
  - `useMedicalStaffsByInstitutionQuery`
  - `useSeedMedicalStaffsMutation`
- 生文字列 query / mutation を廃止

4. urql client ラップ
- `packages/web/src/app/providers/graphql-client.ts` を追加
- `providers.tsx` から `createClient` 直書きを排除

5. 不要物の整理
- `packages/web/codegen.ts` を削除
- `packages/web/src/domains/frontend-data-01/graphql/*.graphql` を削除
- `@pf/web` の `graphql-codegen` 依存/スクリプトを削除

## 現在の実行コマンド

- 型生成一式
  - `pnpm graphql:build`
- schema 抽出のみ
  - `pnpm graphql:extract`
- genql 生成のみ
  - `pnpm graphql:genql`
- web ビルド
  - `pnpm --filter @pf/web build`

## 検証結果

- `pnpm graphql:build` : pass
- `pnpm --filter @pf/web build` : pass

## 次に議論/実装する候補

1. watch 運用
- `functions` の schema 変更をトリガーに `graphql:build` を自動実行する watch を追加する

2. CI ドリフト検知
- 生成後差分がある場合に fail させるジョブを追加する

3. 残ページ展開
- 4-2 以降の GraphQL hooks 追加時も `@pf/graphql/urql` を利用する

## 参照ファイル

- `packages/functions/src/graphql/extract.ts`
- `packages/graphql/urql.ts`
- `packages/web/src/app/providers/graphql-client.ts`
- `packages/web/src/domains/frontend-data-01/hooks/use-medical-staffs-by-institution-query.ts`
- `packages/web/src/domains/frontend-data-01/hooks/use-seed-medical-staffs-mutation.ts`
