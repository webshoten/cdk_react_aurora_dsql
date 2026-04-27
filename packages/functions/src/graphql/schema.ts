import { listMedicalStaffsByInstitution, listSeedItems, upsertDemoMedicalStaffs } from "@pf/core";
import SchemaBuilder from "@pothos/core";
import type { GraphqlContext } from "./context.ts";

const builder = new SchemaBuilder<{
  Context: GraphqlContext;
}>({});

const SeedItemRef = builder.objectRef<{
  code: string;
  label: string;
}>("SeedItem");

const MedicalStaffRef = builder.objectRef<{
  institutionCode: string;
  name: string;
  profession: string;
  staffCode: string;
}>("MedicalStaff");

const UpsertMedicalStaffsPayloadRef = builder.objectRef<{
  appliedCount: number;
}>("UpsertMedicalStaffsPayload");

SeedItemRef.implement({
  fields: (t) => ({
    code: t.exposeString("code"),
    label: t.exposeString("label"),
  }),
});

MedicalStaffRef.implement({
  fields: (t) => ({
    staffCode: t.exposeString("staffCode"),
    institutionCode: t.exposeString("institutionCode"),
    name: t.exposeString("name"),
    profession: t.exposeString("profession"),
  }),
});

UpsertMedicalStaffsPayloadRef.implement({
  fields: (t) => ({
    appliedCount: t.exposeInt("appliedCount"),
  }),
});

builder.queryType({
  fields: (t) => ({
    seedItems: t.field({
      type: [SeedItemRef],
      resolve: async (_root, _args, context) => listSeedItems(context.dbClient),
    }),
    medicalStaffsByInstitution: t.field({
      type: [MedicalStaffRef],
      args: {
        institutionCode: t.arg.string({ required: true }),
      },
      resolve: async (_root, args, context) =>
        listMedicalStaffsByInstitution(context.dbClient, args.institutionCode),
    }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    seedMedicalStaffs: t.field({
      type: UpsertMedicalStaffsPayloadRef,
      resolve: async (_root, _args, context) => ({
        appliedCount: await upsertDemoMedicalStaffs(context.dbClient),
      }),
    }),
  }),
});

/*
 * # GraphQL スキーマ定義
 *
 * ## 目的
 * Yoga サーバーに渡される GraphQL スキーマ本体。Pothos で型・Query・Mutation を組み立て最終的に GraphQLSchema を吐く。
 *
 * ## 説明
 * resolver は core の repository / use case 関数を直接呼び出す薄い層。
 * SeedItem / MedicalStaff / UpsertMedicalStaffsPayload の 3 型と、Query 2 件・Mutation 1 件で構成。
 */
export const schema = builder.toSchema();
