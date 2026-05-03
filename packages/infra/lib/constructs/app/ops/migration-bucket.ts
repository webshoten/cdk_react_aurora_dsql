import * as s3 from "aws-cdk-lib/aws-s3";
import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";

/*
 * # Migration artifact bucket 生成
 *
 * ## 目的
 * migration/seed SQL zip の保管先 S3 生成責務を分離する。
 */
export function createMigrationBucket(scope: Construct, id: string): s3.Bucket {
  return new s3.Bucket(scope, id, {
    autoDeleteObjects: true,
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    enforceSSL: true,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    versioned: false,
  });
}
