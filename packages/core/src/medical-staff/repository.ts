import { asc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { medicalStaffs } from "../db/schema.ts";
import type { DbClient } from "../db/types.ts";
import { DEMO_MEDICAL_STAFFS } from "./demo-data.ts";
import type { MedicalStaff } from "./types.ts";

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
