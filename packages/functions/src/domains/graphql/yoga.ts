import {
  createGraphqlContext,
  type GraphqlAuthorizerContext,
} from "@functions/domains/graphql/context.ts";
import { schema } from "@functions/domains/graphql/schema/index.ts";
import { createYoga } from "graphql-yoga";

interface GraphqlServerContext {
  authorizer: GraphqlAuthorizerContext | null;
}

/*
 * # Yoga GraphQL サーバーインスタンス
 *
 * ## 目的
 * Lambda ハンドラとローカル開発サーバーが共有する Yoga インスタンス。
 *
 * ## 説明
 * リクエストごとに createGraphqlContext で短命 DbClient を生成。
 * GET /graphql の landing page は無効化（API 専用）。
 */
export const yoga = createYoga<GraphqlServerContext>({
  context: async (initialContext) => createGraphqlContext(initialContext.authorizer),
  graphqlEndpoint: "/graphql",
  landingPage: false,
  schema,
});
