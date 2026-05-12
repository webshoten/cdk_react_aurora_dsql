import { createDsqlClientFromEnv } from "@pf/core";
import { S3Client } from "@aws-sdk/client-s3";

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
