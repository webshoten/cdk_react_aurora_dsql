import { createDsqlClientFromEnv } from "@pf/core";
import { S3Client } from "@aws-sdk/client-s3";
import { requireEnv } from "../shared/env.ts";

export interface GraphqlAuthorizerContext {
  groups: string[];
  institutionCode?: string;
  userId: string;
  username: string;
}

export interface GraphqlContext {
  auth: GraphqlAuthorizerContext | null;
  dbClient: ReturnType<typeof createDsqlClientFromEnv>;
  imageBucket: string;
  imagePrefix: string;
  presignedUrlExpiresSeconds: number;
  s3Client: S3Client;
}

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
  const region = requireEnv("DSQL_REGION");

  return {
    auth,
    dbClient: createDsqlClientFromEnv(process.env),
    imageBucket,
    imagePrefix,
    presignedUrlExpiresSeconds: Number(process.env.PRESIGNED_URL_EXPIRES_SECONDS ?? "300"),
    s3Client: new S3Client({ region }),
  };
}
