import { createDsqlClientFromEnv } from "@pf/core";

export interface GraphqlContext {
  dbClient: ReturnType<typeof createDsqlClientFromEnv>;
}

export function createGraphqlContext(): GraphqlContext {
  return {
    dbClient: createDsqlClientFromEnv(process.env),
  };
}
