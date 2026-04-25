import assert from "node:assert/strict";
import { test } from "node:test";
import { createGraphqlContext } from "../src/graphql/context.ts";

test("graphql context requires dsql env", async () => {
  await assert.rejects(
    async () => createGraphqlContext(),
    /DSQL_DATABASE, DSQL_ENDPOINT, DSQL_PORT, DSQL_REGION, and DSQL_DB_USER are required/,
  );
});
