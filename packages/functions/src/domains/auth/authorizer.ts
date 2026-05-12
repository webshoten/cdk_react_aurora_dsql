import type { APIGatewayRequestAuthorizerEventV2 } from "aws-lambda";
import { CognitoJwtVerifier } from "aws-jwt-verify";

export interface AuthorizerContext {
  groups: string;
  institutionCode: string;
  userId: string;
  username: string;
}

/*
 * ## 目的
 * Authorizer リクエストを検証し、GraphQL へ渡す認可コンテキストを生成する。
 *
 * ## 説明
 * Bearer token（ID token）を検証し、claim から context を正規化する。
 */
export async function authorizeRequest(
  event: APIGatewayRequestAuthorizerEventV2,
): Promise<AuthorizerContext> {
  const token = readBearerToken(event.headers?.authorization ?? event.headers?.Authorization);
  const payload = await verifyIdToken(token);
  const userId = readSub(payload);
  const username = readUsername(payload);
  const groups = readGroups(payload).join(",");
  const institutionCode = readInstitutionCode(payload);

  return {
    groups,
    institutionCode,
    userId,
    username,
  };
}

/*
 * ## 目的
 * Authorization ヘッダーから Bearer token を抽出する。
 *
 * ## 説明
 * 形式不正や未設定時は例外を投げる。
 */
function readBearerToken(headerValue?: string): string {
  if (!headerValue) throw new Error("missing authorization header");
  const [scheme, token] = headerValue.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) throw new Error("invalid authorization header");
  return token;
}

/*
 * ## 目的
 * GraphQL Authorizer 用 ID token を署名検証する。
 *
 * ## 説明
 * CognitoJwtVerifier で tokenUse=id / userPoolId / clientId(aud) を検証し、
 * 検証済み payload を返す。
 */
async function verifyIdToken(token: string): Promise<Record<string, unknown>> {
  const userPoolId = process.env.USER_POOL_ID;
  const userPoolClientId = process.env.USER_POOL_CLIENT_ID;
  if (!userPoolId || !userPoolClientId) {
    throw new Error("USER_POOL_ID and USER_POOL_CLIENT_ID are required");
  }

  try {
    const verifier = CognitoJwtVerifier.create({
      userPoolId,
      tokenUse: "id",
      clientId: userPoolClientId,
    });
    return (await verifier.verify(token)) as unknown as Record<string, unknown>;
  } catch (cause) {
    const reason = cause instanceof Error ? cause.message : String(cause);
    throw new Error(`idToken verification failed: ${reason}`);
  }
}

/*
 * ## 目的
 * token claim から sub を取得する。
 *
 * ## 説明
 * sub が存在しない場合は例外を投げる。
 */
function readSub(payload: Record<string, unknown>): string {
  const sub = payload.sub;
  if (typeof sub !== "string" || !sub) throw new Error("sub not found");
  return sub;
}

/*
 * ## 目的
 * token claim から username を取得する。
 *
 * ## 説明
 * cognito:username がない場合は空文字を返す。
 */
function readUsername(payload: Record<string, unknown>): string {
  const username = payload["cognito:username"];
  if (typeof username !== "string") return "";
  return username;
}

/*
 * ## 目的
 * group claim を文字列配列へ正規化する。
 *
 * ## 説明
 * claim が配列でない場合は空配列を返す。
 */
function readGroups(payload: Record<string, unknown>): string[] {
  const raw = payload["cognito:groups"];
  if (!Array.isArray(raw)) return [];
  return raw.filter((v): v is string => typeof v === "string");
}

/*
 * ## 目的
 * institution_id claim を取得する。
 *
 * ## 説明
 * 未設定時は空文字を返す。
 */
function readInstitutionCode(payload: Record<string, unknown>): string {
  const value = payload["custom:institution_id"];
  return typeof value === "string" ? value : "";
}
