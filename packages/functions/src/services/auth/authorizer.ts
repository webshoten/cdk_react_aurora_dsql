import { CognitoIdentityProviderClient, GetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import type { APIGatewayRequestAuthorizerEventV2 } from "aws-lambda";

export interface AuthorizerContext {
  groups: string;
  institutionCode: string;
  userId: string;
  username: string;
}

const cognito = new CognitoIdentityProviderClient({ region: process.env.COGNITO_REGION });

/*
 * ## 目的
 * Authorizer リクエストを検証し、GraphQL へ渡す認可コンテキストを生成する。
 *
 * ## 説明
 * Bearer token を検証し、Cognito からユーザー情報を取得して context へ正規化する。
 */
export async function authorizeRequest(
  event: APIGatewayRequestAuthorizerEventV2,
): Promise<AuthorizerContext> {
  const token = readBearerToken(event.headers?.authorization ?? event.headers?.Authorization);
  const payload = decodeJwtPayload(token);
  validateTokenClaims(payload);

  const response = await cognito.send(
    new GetUserCommand({
      AccessToken: token,
    }),
  );

  const userId = readSub(response.UserAttributes);
  const username = response.Username ?? "";
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
 * JWT payload を JSON として取得する。
 *
 * ## 説明
 * Base64URL を通常 Base64 へ変換して decode する。
 */
function decodeJwtPayload(token: string): Record<string, unknown> {
  const parts = token.split(".");
  const payload = parts[1];
  if (!payload) throw new Error("invalid token");

  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const decoded = Buffer.from(base64, "base64").toString("utf8");
  return JSON.parse(decoded) as Record<string, unknown>;
}

/*
 * ## 目的
 * token claims の必須条件を検証する。
 *
 * ## 説明
 * access token であることと、想定 client_id であることを確認する。
 */
function validateTokenClaims(payload: Record<string, unknown>): void {
  const tokenUse = payload.token_use;
  if (tokenUse !== "access") throw new Error("token_use must be access");

  const expectedClientId = process.env.USER_POOL_CLIENT_ID;
  const clientId = payload.client_id;
  if (!expectedClientId || clientId !== expectedClientId) {
    throw new Error("invalid client_id");
  }
}

/*
 * ## 目的
 * Cognito 属性から sub を取得する。
 *
 * ## 説明
 * sub が存在しない場合は例外を投げる。
 */
function readSub(attributes?: { Name?: string; Value?: string }[]): string {
  const sub = attributes?.find((attr) => attr.Name === "sub")?.Value;
  if (!sub) throw new Error("sub not found");
  return sub;
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
