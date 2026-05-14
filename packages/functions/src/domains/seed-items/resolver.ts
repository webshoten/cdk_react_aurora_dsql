import type { GraphqlContext } from "@functions/shared/context/graphql-context.ts";
import { listSeedItems } from "@pf/core";

/*
 * ## 目的
 * シード項目一覧を返す。
 *
 * ## 説明
 * DB の demo_seed_items をそのまま返却する。
 */
export async function resolveSeedItems(context: GraphqlContext) {
  return listSeedItems(context.dbClient);
}
