import type { AppSchemaBuilder } from "@functions/domains/graphql/schema/types.ts";
import { resolveSeedItems } from "@functions/domains/seed-items/resolver.ts";

export function registerSeedItemsSchema(builder: AppSchemaBuilder): void {
  const SeedItemRef = builder.objectRef<{ code: string; label: string }>("SeedItem");

  SeedItemRef.implement({
    fields: (t) => ({
      code: t.exposeString("code", { description: "シード項目コード。" }),
      label: t.exposeString("label", { description: "シード項目ラベル。" }),
    }),
  });

  builder.queryField("seedItems", (t) =>
    t.field({
      description: "シード項目一覧を返す。",
      type: [SeedItemRef],
      resolve: async (_root, _args, context) => resolveSeedItems(context),
    }),
  );
}
