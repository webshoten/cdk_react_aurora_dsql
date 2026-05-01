import {
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminGetUserCommand,
  AdminSetUserPasswordCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import { requireEnv } from "../../shared/env.ts";

/*
 * ## 目的
 * Cognito API クライアントを生成する。
 *
 * ## 説明
 * 実行リージョンは環境変数 `COGNITO_REGION` から解決する。
 */
function createClient(): CognitoIdentityProviderClient {
  return new CognitoIdentityProviderClient({ region: requireEnv("COGNITO_REGION") });
}

/*
 * ## 目的
 * 認証基盤側へ新規ユーザーを作成する。
 *
 * ## 説明
 * 作成後に permanent password を設定し、作成済みユーザーの sub を返す。
 */
export async function createAuthUser(input: {
  email: string;
  password: string;
  username: string;
}): Promise<{ sub: string; username: string }> {
  return createUserInIdentityProvider(input);
}

/*
 * ## 目的
 * 認証基盤側のユーザーを削除する。
 *
 * ## 説明
 * DB 登録失敗時などの補償処理から呼び出す。
 */
export async function deleteAuthUser(input: { username: string }): Promise<void> {
  const userPoolId = requireEnv("USER_POOL_ID");
  const client = createClient();
  await client.send(
    new AdminDeleteUserCommand({
      UserPoolId: userPoolId,
      Username: input.username,
    }),
  );
}

/*
 * ## 目的
 * ユーザーのパスワードを再設定する。
 *
 * ## 説明
 * 一時パスワードを生成し、次回ログイン時に変更必須（Permanent=false）で設定する。
 */
export async function resetAuthUserPassword(input: {
  username: string;
}): Promise<{ temporaryPassword: string; username: string }> {
  const userPoolId = requireEnv("USER_POOL_ID");
  const client = createClient();
  const temporaryPassword = generateTemporaryPassword();

  await client.send(
    new AdminSetUserPasswordCommand({
      UserPoolId: userPoolId,
      Username: input.username,
      Password: temporaryPassword,
      Permanent: false,
    }),
  );

  return {
    username: input.username,
    temporaryPassword,
  };
}

/*
 * ## 目的
 * 認証基盤ユーザー作成の内部実装を集約する。
 *
 * ## 説明
 * 作成途中で失敗した場合は、作成済みユーザーを削除してロールバックする。
 */
async function createUserInIdentityProvider(input: {
  email: string;
  password: string;
  username: string;
}): Promise<{ sub: string; username: string }> {
  const userPoolId = requireEnv("USER_POOL_ID");
  const client = createClient();
  let createdInIdentityProvider = false;

  try {
    await client.send(
      new AdminCreateUserCommand({
        UserPoolId: userPoolId,
        Username: input.username,
        MessageAction: "SUPPRESS",
        UserAttributes: [
          { Name: "email", Value: input.email },
          { Name: "email_verified", Value: "true" },
        ],
      }),
    );
    createdInIdentityProvider = true;

    await client.send(
      new AdminSetUserPasswordCommand({
        UserPoolId: userPoolId,
        Username: input.username,
        Password: input.password,
        Permanent: true,
      }),
    );

    const describe = await client.send(
      new AdminGetUserCommand({
        UserPoolId: userPoolId,
        Username: input.username,
      }),
    );
    const sub = describe.UserAttributes?.find((attr) => attr.Name === "sub")?.Value;
    if (!sub) throw new Error("Cognito sub not found");

    return { username: input.username, sub };
  } catch (error: unknown) {
    if (createdInIdentityProvider) {
      try {
        await client.send(
          new AdminDeleteUserCommand({
            UserPoolId: userPoolId,
            Username: input.username,
          }),
        );
      } catch (rollbackError: unknown) {
        const message = rollbackError instanceof Error ? rollbackError.message : String(rollbackError);
        console.error(`[createAuthUser] rollback failed: ${message}`);
      }
    }
    throw error;
  }
}

/*
 * ## 目的
 * 一時パスワード文字列を生成する。
 *
 * ## 説明
 * 最低限の複雑性（記号・英字・数字）を含む形式で作る。
 */
function generateTemporaryPassword(): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `Tmp#${random}9A`;
}
