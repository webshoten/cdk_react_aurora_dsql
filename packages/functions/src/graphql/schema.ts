import { select1 } from "@pf/core";
import SchemaBuilder from "@pothos/core";
import type { GraphqlContext } from "./context.ts";

const builder = new SchemaBuilder<{
  Context: GraphqlContext;
}>({});

builder.queryType({
  fields: (t) => ({
    hello: t.int({
      nullable: true,
      resolve: async (_root, _args, context) => select1(context.dbClient),
    }),
  }),
});

export const schema = builder.toSchema();
