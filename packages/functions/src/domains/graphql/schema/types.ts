import type { GraphqlContext } from "@functions/shared/context/graphql-context.ts";
import SchemaBuilder from "@pothos/core";

function createAppSchemaBuilder() {
  return new SchemaBuilder<{
    Context: GraphqlContext;
  }>({});
}

export type AppSchemaBuilder = ReturnType<typeof createAppSchemaBuilder>;
