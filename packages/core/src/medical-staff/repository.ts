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

const SAMPLE_FAMILY_NAMES = ["Sato", "Suzuki", "Takahashi", "Tanaka", "Ito"] as const;
const SAMPLE_GIVEN_NAMES = ["Taro", "Hanako", "Ken", "Yui", "Haru"] as const;
const SAMPLE_PROFESSIONS = ["doctor", "nurse", "pharmacist", "therapist"] as const;

function randomPick<T>(values: readonly T[]): T {
  const index = Math.floor(Math.random() * values.length);
  return values[index] as T;
}

/*
 * # ランダム医療スタッフ 1 件追加
 *
 * ## 目的
 * 一覧変化を目視確認するため、毎回異なる staff_code / name の 1 レコードを追加する。
 *
 * ## 説明
 * 複雑なルールは持たず、固定候補からランダム選択して INSERT する最小実装。
 */
export async function addRandomMedicalStaff(
  dbClient: DbClient,
  institutionCode: string,
): Promise<number> {
  return dbClient(async (db) => {
    const drizzleDb = drizzle(db);
    const suffix = `${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
    const name = `${randomPick(SAMPLE_GIVEN_NAMES)} ${randomPick(SAMPLE_FAMILY_NAMES)}`;

    await drizzleDb.insert(medicalStaffs).values({
      staffCode: `auto-${suffix}`,
      institutionCode,
      name,
      profession: randomPick(SAMPLE_PROFESSIONS),
    });

    return 1;
  });
}

/*
 * # 医療スタッフ全削除（医療機関単位）
 *
 * ## 目的
 * 再投入・再取得の動作確認を繰り返しやすくするため、対象 institution のデータを一括削除する。
 *
 * ## 説明
 * DELETE の returning 件数を削除件数として返す。
 */
export async function clearMedicalStaffsByInstitution(
  dbClient: DbClient,
  institutionCode: string,
): Promise<number> {
  return dbClient(async (db) => {
    const drizzleDb = drizzle(db);
    const deletedRows = await drizzleDb
      .delete(medicalStaffs)
      .where(eq(medicalStaffs.institutionCode, institutionCode))
      .returning({ staffCode: medicalStaffs.staffCode });

    return deletedRows.length;
  });
}
