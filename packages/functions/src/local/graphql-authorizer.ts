import type { APIGatewayRequestAuthorizerEventV2 } from "aws-lambda";
import type { GraphqlAuthorizerContext } from "../graphql/context.ts";
import { authorizeRequest } from "../services/auth/authorizer.ts";

/*
 * # ローカル GraphQL 疑似 Authorizer
 *
 * ## 目的
 * ローカル server でも `Authorization: Bearer <idToken>` を検証し、GraphQL `context.auth` を構成する。
 *
 * ## 説明
 * API Gateway v2 authorizer event 互換の最小入力を組み立て、既存 `authorizeRequest` を再利用する。
 * 検証失敗時は null を返し、resolver 側の unauthorized 判定へ委ねる。
 */
export async function authorizeGraphqlLocalRequest(
  headers: Record<string, string | string[] | undefined>,
): Promise<GraphqlAuthorizerContext | null> {
  const authorization = readHeader(headers, "authorization");
  if (!authorization) return null;

  const event = {
    headers: {
      authorization,
    },
  } as unknown as APIGatewayRequestAuthorizerEventV2;

  try {
    const context = await authorizeRequest(event);
    return {
      userId: context.userId,
      username: context.username,
      institutionCode: context.institutionCode || undefined,
      groups: context.groups
        .split(",")
        .map((group) => group.trim())
        .filter((group) => group.length > 0),
    };
  } catch (cause) {
    const reason = cause instanceof Error ? cause.message : String(cause);
    console.warn(
      JSON.stringify({
        message: "Local GraphQL authorizer failed",
        reason,
      }),
    );
    return null;
  }
}

function readHeader(
  headers: Record<string, string | string[] | undefined>,
  name: string,
): string | undefined {
  const direct = headers[name];
  if (typeof direct === "string") return direct;

  const lower = headers[name.toLowerCase()];
  if (typeof lower === "string") return lower;

  return undefined;
}
