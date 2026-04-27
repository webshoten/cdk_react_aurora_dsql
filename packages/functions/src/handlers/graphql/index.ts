import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { yoga } from "../../graphql/yoga.ts";

/*
 * # GraphQL Lambda ハンドラ（API Gateway v2）
 *
 * ## 目的
 * API Gateway HTTP API → Yoga への入口。Lambda 実行環境で GraphQL リクエストを受ける唯一のエントリ。
 *
 * ## 説明
 * APIGatewayProxyEventV2 を Yoga の fetch 形式（URL + Request init）に変換し、レスポンスを Lambda 形式へ戻す薄いアダプタ。
 * base64 ボディ（バイナリ送信）は Buffer に復元してから渡す。
 *
 * ## NOTE
 * - レスポンス body を text() で固定。バイナリ応答（画像等）は壊れる可能性あり。GraphQL 用途では問題なし。
 */
export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  const response = await yoga.fetch(
    `https://${event.requestContext.domainName}${event.requestContext.http.path}?${event.rawQueryString}`,
    {
      method: event.requestContext.http.method,
      headers: event.headers as HeadersInit,
      body: event.body && event.isBase64Encoded ? Buffer.from(event.body, "base64") : event.body,
    },
  );

  return {
    statusCode: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    body: await response.text(),
  };
};
