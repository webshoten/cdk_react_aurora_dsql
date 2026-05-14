import { type AuthorizerContext, authorizeRequest } from "@functions/domains/auth/authorizer.ts";
import type {
  APIGatewayRequestAuthorizerEventV2,
  APIGatewaySimpleAuthorizerResult,
} from "aws-lambda";

/*
 * # Lambda Authorizer ハンドラ
 *
 * ## 目的
 * API Gateway のカスタム Authorizer 入口として、認証可否とコンテキストを返す。
 *
 * ## 説明
 * 実処理は services 層へ委譲し、ハンドラは成功/失敗レスポンス整形のみ担当する。
 */
export async function handler(
  event: APIGatewayRequestAuthorizerEventV2,
): Promise<APIGatewaySimpleAuthorizerResult & { context: AuthorizerContext }> {
  try {
    const context = await authorizeRequest(event);
    return {
      isAuthorized: true,
      context,
    };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    console.warn(
      JSON.stringify({
        message: "GraphqlAuthorizer authorization failed",
        reason: message,
      }),
    );
    return {
      isAuthorized: false,
      context: {
        groups: "",
        institutionCode: "",
        userId: "",
        username: "",
      },
    };
  }
}
