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

export const schema = builder.toSchema();
