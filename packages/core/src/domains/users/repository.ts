import { asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { users } from "@core/shared/db/schema.ts";
import type { DbClient } from "@core/shared/db/types.ts";

/*
 * # users repository
 *
 * ## 目的
 * users テーブルへの参照・登録処理を集約する。
 */
export interface UserRow {
  createdAt: Date;
  email: string;
  medicalInstitutionId: string | null;
  mfaPreference: string | null;
  uid: string;
  userType: string;
  username: string;
}

/*
 * ## 目的
 * users 一覧を取得する。
 *
 * ## 説明
 * users 一覧を作成日時の昇順で取得する。
 */
export async function listUsers(dbClient: DbClient): Promise<UserRow[]> {
  return dbClient(async (db) => {
    const drizzleDb = drizzle(db);
    return drizzleDb
      .select({
        uid: users.uid,
        username: users.username,
        email: users.email,
        userType: users.userType,
        medicalInstitutionId: users.medicalInstitutionId,
        mfaPreference: users.mfaPreference,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(asc(users.createdAt));
  });
}

/*
 * ## 目的
 * users テーブルへユーザーを登録する。
 *
 * ## 説明
 * users テーブルへ 1 レコードを登録する。
 */
export async function createUserRecord(
  dbClient: DbClient,
  input: {
    uid: string;
    username: string;
    email: string;
    userType: string;
    medicalInstitutionId?: string;
    mfaPreference?: string;
  },
): Promise<void> {
  return dbClient(async (db) => {
    const drizzleDb = drizzle(db);
    await drizzleDb.insert(users).values({
      uid: input.uid,
      username: input.username,
      email: input.email,
      userType: input.userType,
      medicalInstitutionId: input.medicalInstitutionId,
      mfaPreference: input.mfaPreference ?? "none",
    });
  });
}

/*
 * ## 目的
 * username から users レコードを検索する。
 *
 * ## 説明
 * username をキーに users を 1 件検索し、未登録時は null を返す。
 */
export async function findUserByUsername(
  dbClient: DbClient,
  username: string,
): Promise<UserRow | null> {
  return dbClient(async (db) => {
    const drizzleDb = drizzle(db);
    const rows = await drizzleDb
      .select({
        uid: users.uid,
        username: users.username,
        email: users.email,
        userType: users.userType,
        medicalInstitutionId: users.medicalInstitutionId,
        mfaPreference: users.mfaPreference,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return rows[0] ?? null;
  });
}

/*
 * ## 目的
 * username 指定で users の mfaPreference を更新する。
 *
 * ## 説明
 * 更新対象がない場合は何もしない。
 */
export async function updateUserMfaPreferenceByUsername(
  dbClient: DbClient,
  input: { mfaPreference: "none" | "sms" | "email"; username: string },
): Promise<void> {
  return dbClient(async (db) => {
    const drizzleDb = drizzle(db);
    await drizzleDb
      .update(users)
      .set({
        mfaPreference: input.mfaPreference,
      })
      .where(eq(users.username, input.username));
  });
}

/*
 * ## 目的
 * username 指定で users レコードを削除する。
 *
 * ## 説明
 * 削除対象がない場合は false を返し、削除した場合は true を返す。
 */
export async function deleteUserRecordByUsername(
  dbClient: DbClient,
  username: string,
): Promise<boolean> {
  return dbClient(async (db) => {
    const drizzleDb = drizzle(db);
    const rows = await drizzleDb
      .select({ uid: users.uid })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (!rows[0]) {
      return false;
    }

    await drizzleDb.delete(users).where(eq(users.username, username));
    return true;
  });
}
