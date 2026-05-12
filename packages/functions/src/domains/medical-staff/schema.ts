import type { AppSchemaBuilder } from "@functions/domains/graphql/schema/types.ts";
import {
  resolveAddRandomMedicalStaff,
  resolveClearMedicalStaffsByInstitution,
  resolveMedicalStaffsByInstitution,
  resolveSeedMedicalStaffs,
} from "@functions/domains/medical-staff/resolver.ts";

export function registerMedicalStaffSchema(builder: AppSchemaBuilder): void {
  const MedicalStaffRef = builder.objectRef<{
    institutionCode: string;
    name: string;
    profession: string;
    staffCode: string;
  }>("MedicalStaff");
  const UpsertMedicalStaffsPayloadRef = builder.objectRef<{ appliedCount: number }>(
    "UpsertMedicalStaffsPayload",
  );

  MedicalStaffRef.implement({
    fields: (t) => ({
      staffCode: t.exposeString("staffCode", { description: "スタッフコード。" }),
      institutionCode: t.exposeString("institutionCode", { description: "所属機関コード。" }),
      name: t.exposeString("name", { description: "スタッフ名。" }),
      profession: t.exposeString("profession", { description: "職種。" }),
    }),
  });

  UpsertMedicalStaffsPayloadRef.implement({
    fields: (t) => ({
      appliedCount: t.exposeInt("appliedCount", { description: "反映件数。" }),
    }),
  });

  builder.queryField("medicalStaffsByInstitution", (t) =>
    t.field({
      description: "指定機関のスタッフ一覧を返す。",
      type: [MedicalStaffRef],
      args: {
        institutionCode: t.arg.string({ required: true }),
      },
      resolve: async (_root, args, context) => resolveMedicalStaffsByInstitution(context, args),
    }),
  );

  builder.mutationField("seedMedicalStaffs", (t) =>
    t.field({
      description: "デモ用スタッフデータを投入/更新する。",
      type: UpsertMedicalStaffsPayloadRef,
      resolve: async (_root, _args, context) => resolveSeedMedicalStaffs(context),
    }),
  );

  builder.mutationField("addRandomMedicalStaff", (t) =>
    t.field({
      description: "指定機関へランダムスタッフを1件追加する。",
      type: UpsertMedicalStaffsPayloadRef,
      args: {
        institutionCode: t.arg.string({ required: true }),
      },
      resolve: async (_root, args, context) => resolveAddRandomMedicalStaff(context, args),
    }),
  );

  builder.mutationField("clearMedicalStaffsByInstitution", (t) =>
    t.field({
      description: "指定機関のスタッフを全削除する。",
      type: UpsertMedicalStaffsPayloadRef,
      args: {
        institutionCode: t.arg.string({ required: true }),
      },
      resolve: async (_root, args, context) =>
        resolveClearMedicalStaffsByInstitution(context, args),
    }),
  );
}
