import { listSeedItems } from "@pf/core";
import SchemaBuilder from "@pothos/core";
import type { GraphqlContext } from "./context.ts";

const builder = new SchemaBuilder<{
  Context: GraphqlContext;
}>({});

const SeedItemRef = builder.objectRef<{
  code: string;
  label: string;
}>("SeedItem");

SeedItemRef.implement({
  fields: (t) => ({
    code: t.exposeString("code"),
    label: t.exposeString("label"),
  }),
});

builder.queryType({
  fields: (t) => ({
    seedItems: t.field({
      type: [SeedItemRef],
      resolve: async (_root, _args, context) => listSeedItems(context.dbClient),
    }),
  }),
});

export const schema = builder.toSchema();
