import { asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { users } from "../db/schema.ts";
import type { DbClient } from "../db/types.ts";

/*
 * # users repository
 *
 * ## 目的
 * users テーブルへの参照・登録処理を集約する。
 */
export interface UserRow {
  createdAt: Date;
  email: string;
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
export async function findUserByUsername(dbClient: DbClient, username: string): Promise<UserRow | null> {
  return dbClient(async (db) => {
    const drizzleDb = drizzle(db);
    const rows = await drizzleDb
      .select({
        uid: users.uid,
        username: users.username,
        email: users.email,
        userType: users.userType,
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
