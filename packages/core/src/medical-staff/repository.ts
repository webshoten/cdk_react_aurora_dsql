import { asc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { medicalStaffs } from "../db/schema.ts";
import type { DbClient } from "../db/types.ts";
import { DEMO_MEDICAL_STAFFS } from "./demo-data.ts";
import type { MedicalStaff } from "./types.ts";

/*
 * # 医療機関別スタッフ一覧
 *
 * ## 目的
 * GraphQL リクエスト経由で institution_code 指定のスタッフ一覧を返す参照系。
 *
 * ## 説明
 * staff_code 昇順。DbClient スコープ内で 1 クエリ完結。
 */
export async function listMedicalStaffsByInstitution(
  dbClient: DbClient,
  institutionCode: string,
): Promise<MedicalStaff[]> {
  return dbClient(async (db) => {
    const drizzleDb = drizzle(db);

    const rows = await drizzleDb
      .select({
        staffCode: medicalStaffs.staffCode,
        institutionCode: medicalStaffs.institutionCode,
        name: medicalStaffs.name,
        profession: medicalStaffs.profession,
      })
      .from(medicalStaffs)
      .where(eq(medicalStaffs.institutionCode, institutionCode))
      .orderBy(asc(medicalStaffs.staffCode));

    return rows;
  });
}

/*
 * # デモスタッフ upsert
 *
 * ## 目的
 * GraphQL mutation 経由で固定デモデータ（DEMO_MEDICAL_STAFFS）を投入する操作系。動作確認用。
 *
 * ## 説明
 * staff_code 衝突時は institution_code / name / profession / updated_at を上書き。
 * 戻り値はデモデータ件数（DB の実 affected rows ではない）。
 *
 * ## NOTE
 * - 戻り値が「投入を試みた件数」で、実際に upsert された件数ではない点に注意。
 */
export async function upsertDemoMedicalStaffs(dbClient: DbClient): Promise<number> {
  return dbClient(async (db) => {
    const drizzleDb = drizzle(db);

    await drizzleDb
      .insert(medicalStaffs)
      .values(DEMO_MEDICAL_STAFFS)
      .onConflictDoUpdate({
        target: medicalStaffs.staffCode,
        set: {
          institutionCode: sql`excluded.institution_code`,
          name: sql`excluded.name`,
          profession: sql`excluded.profession`,
          updatedAt: sql`now()`,
        },
      });

    return DEMO_MEDICAL_STAFFS.length;
  });
}
