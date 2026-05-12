import SchemaBuilder from "@pothos/core";
import type { GraphqlContext } from "@functions/shared/context/graphql-context.ts";

function createAppSchemaBuilder() {
  return new SchemaBuilder<{
    Context: GraphqlContext;
  }>({});
}

export type AppSchemaBuilder = ReturnType<typeof createAppSchemaBuilder>;
