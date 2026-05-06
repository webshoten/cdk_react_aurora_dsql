import type * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import type * as s3 from "aws-cdk-lib/aws-s3";
import type { Construct } from "constructs";

export interface CreateWebDistributionInput {
  bucket: s3.Bucket;
  certificate?: acm.ICertificate;
  domainNames?: string[];
}

/*
 * # Web 配信用 CloudFront 生成
 *
 * ## 目的
 * Web 用 Distribution 生成責務を分離する。
 */
export function createWebDistribution(
  scope: Construct,
  id: string,
  input: CreateWebDistributionInput,
): cloudfront.Distribution {
  return new cloudfront.Distribution(scope, id, {
    defaultBehavior: {
      origin: origins.S3BucketOrigin.withOriginAccessControl(input.bucket),
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
    },
    certificate: input.certificate,
    domainNames: input.domainNames,
    defaultRootObject: "index.html",
    errorResponses: [
      {
        httpStatus: 403,
        responseHttpStatus: 200,
        responsePagePath: "/index.html",
      },
      {
        httpStatus: 404,
        responseHttpStatus: 200,
        responsePagePath: "/index.html",
      },
    ],
  });
}
