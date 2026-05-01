import type {
  APIGatewayRequestAuthorizerEventV2,
  APIGatewaySimpleAuthorizerResult,
} from "aws-lambda";
import { authorizeRequest, type AuthorizerContext } from "../../../services/auth/authorizer.ts";

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
  } catch {
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
