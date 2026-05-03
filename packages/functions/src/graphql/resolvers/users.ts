import { createUserRecord, listUsers, updateUserMfaPreferenceByUsername } from "@pf/core";
import { createAuthUser, deleteAuthUser, resetAuthUserPassword } from "../../services/auth/identity-provider.ts";
import type { GraphqlContext } from "../context.ts";

/*
 * ## 目的
 * 認証済みユーザー情報を返す。
 *
 * ## 説明
 * 未認証時は null を返す。
 */
export async function resolveCurrentUser(context: GraphqlContext): Promise<GraphqlContext["auth"]> {
  if (!context.auth) return null;
  return context.auth;
}

/*
 * ## 目的
 * users 一覧を返す。
 *
 * ## 説明
 * DB の日時を API 返却用に ISO8601 文字列へ変換する。
 */
export async function resolveUsers(context: GraphqlContext): Promise<
  {
    createdAt: string;
    email: string;
    mfaPreference: string;
    uid: string;
    userType: string;
    username: string;
  }[]
> {
  const rows = await listUsers(context.dbClient);
  return rows.map((row) => ({
    ...row,
    mfaPreference: row.mfaPreference ?? "none",
    createdAt: row.createdAt.toISOString(),
  }));
}

/*
 * ## 目的
 * 認証基盤と users テーブルへユーザーを作成する。
 *
 * ## 説明
 * DB 登録失敗時は認証基盤側ユーザーを削除して補償する。
 */
export async function resolveCreateUser(
  context: GraphqlContext,
  args: { email: string; password: string; username: string },
): Promise<{ username: string }> {
  const authUser = await createAuthUser({
    username: args.username,
    password: args.password,
    email: args.email,
  });

  try {
    await createUserRecord(context.dbClient, {
      uid: authUser.sub,
      username: args.username,
      email: args.email,
      userType: "general",
    });
  } catch (error: unknown) {
    try {
      await deleteAuthUser({ username: args.username });
    } catch (rollbackError: unknown) {
      const message = rollbackError instanceof Error ? rollbackError.message : String(rollbackError);
      console.error(`[createUser resolver] rollback failed: ${message}`);
    }
    throw error;
  }

  return { username: args.username };
}

/*
 * ## 目的
 * ユーザーのパスワードを再設定する。
 *
 * ## 説明
 * 一時パスワードを返却し、呼び出し元で表示できるようにする。
 */
export async function resolveResetUserPassword(args: { username: string }): Promise<{
  temporaryPassword: string;
  username: string;
}> {
  return resetAuthUserPassword({
    username: args.username,
  });
}

/*
 * ## 目的
 * 認証ユーザー自身の mfaPreference を users テーブルへ同期する。
 *
 * ## 説明
 * context に認証ユーザーがない場合は拒否する。
 */
export async function resolveSyncCurrentUserMfaPreference(
  context: GraphqlContext,
  args: { mfaPreference: "none" | "sms" | "email" },
): Promise<{ synced: boolean }> {
  if (!context.auth?.username) {
    throw new Error("unauthorized");
  }

  await updateUserMfaPreferenceByUsername(context.dbClient, {
    username: context.auth.username,
    mfaPreference: args.mfaPreference,
  });

  return { synced: true };
}
