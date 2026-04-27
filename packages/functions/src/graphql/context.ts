import { createDsqlClientFromEnv } from "@pf/core";

export interface GraphqlContext {
  dbClient: ReturnType<typeof createDsqlClientFromEnv>;
}

/*
 * # GraphQL リクエストコンテキスト生成
 *
 * ## 目的
 * Yoga が各 GraphQL リクエストごとに呼ぶコンテキストファクトリ。resolver から DB アクセスする入口を組み立てる。
 *
 * ## 説明
 * 環境変数から DbClient を都度生成。コンテキスト自体は使い捨て（リクエスト終了で破棄）。
 */
export function createGraphqlContext(): GraphqlContext {
  return {
    dbClient: createDsqlClientFromEnv(process.env),
  };
}
