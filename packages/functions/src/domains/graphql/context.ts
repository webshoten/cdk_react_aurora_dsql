import { S3Client } from "@aws-sdk/client-s3";
import type {
  GraphqlAuthorizerContext,
  GraphqlContext,
} from "@functions/shared/context/graphql-context.ts";
import { requireEnv } from "@functions/shared/env.ts";
import { createDsqlClientFromEnv } from "@pf/core";

export type {
  GraphqlAuthorizerContext,
  GraphqlContext,
} from "@functions/shared/context/graphql-context.ts";

/*
 * # GraphQL リクエストコンテキスト生成
 *
 * ## 目的
 * Yoga が各 GraphQL リクエストごとに呼ぶコンテキストファクトリ。resolver から DB アクセスする入口を組み立てる。
 *
 * ## 説明
 * 環境変数から DbClient を都度生成。コンテキスト自体は使い捨て（リクエスト終了で破棄）。
 */
export function createGraphqlContext(auth: GraphqlAuthorizerContext | null = null): GraphqlContext {
  const imageBucket = requireEnv("IMAGE_BUCKET");
  const imagePrefix = requireEnv("IMAGE_PREFIX");
  const region = requireEnv("AWS_REGION");

  return {
    auth,
    dbClient: createDsqlClientFromEnv(process.env),
    imageBucket,
    imagePrefix,
    presignedUrlExpiresSeconds: Number(process.env.PRESIGNED_URL_EXPIRES_SECONDS ?? "300"),
    s3Client: new S3Client({ region }),
  };
}
