import * as path from "node:path";
import type * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import type * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import type { Construct } from "constructs";

/*
 * # Web 静的アセットデプロイ
 *
 * ## 目的
 * S3 への静的アセット配備と CloudFront invalidation の責務を分離する。
 */
export function createWebDeployment(
  scope: Construct,
  id: string,
  input: {
    configContent: string;
    destinationBucket: s3.Bucket;
    distribution: cloudfront.Distribution;
  },
): s3deploy.BucketDeployment {
  return new s3deploy.BucketDeployment(scope, id, {
    sources: [
      s3deploy.Source.asset(path.join(__dirname, "../../../../../web/dist")),
      s3deploy.Source.data("config.js", input.configContent),
    ],
    destinationBucket: input.destinationBucket,
    distribution: input.distribution,
    distributionPaths: ["/*"],
  });
}
