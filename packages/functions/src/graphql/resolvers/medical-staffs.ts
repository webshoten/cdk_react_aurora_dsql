import { addRandomMedicalStaff, clearMedicalStaffsByInstitution, listMedicalStaffsByInstitution, upsertDemoMedicalStaffs } from "@pf/core";
import type { GraphqlContext } from "../context.ts";

/*
 * ## 目的
 * 指定機関のスタッフ一覧を返す。
 *
 * ## 説明
 * institutionCode で絞り込んで取得する。
 */
export async function resolveMedicalStaffsByInstitution(
  context: GraphqlContext,
  args: { institutionCode: string },
) {
  return listMedicalStaffsByInstitution(context.dbClient, args.institutionCode);
}

/*
 * ## 目的
 * デモ用スタッフデータを投入/更新する。
 *
 * ## 説明
 * 反映件数を payload 形式で返す。
 */
export async function resolveSeedMedicalStaffs(context: GraphqlContext): Promise<{ appliedCount: number }> {
  return {
    appliedCount: await upsertDemoMedicalStaffs(context.dbClient),
  };
}

/*
 * ## 目的
 * 指定機関へランダムスタッフを1件追加する。
 *
 * ## 説明
 * 追加結果の件数を payload 形式で返す。
 */
export async function resolveAddRandomMedicalStaff(
  context: GraphqlContext,
  args: { institutionCode: string },
): Promise<{ appliedCount: number }> {
  return {
    appliedCount: await addRandomMedicalStaff(context.dbClient, args.institutionCode),
  };
}

/*
 * ## 目的
 * 指定機関のスタッフを全削除する。
 *
 * ## 説明
 * 削除件数を payload 形式で返す。
 */
export async function resolveClearMedicalStaffsByInstitution(
  context: GraphqlContext,
  args: { institutionCode: string },
): Promise<{ appliedCount: number }> {
  return {
    appliedCount: await clearMedicalStaffsByInstitution(context.dbClient, args.institutionCode),
  };
}
