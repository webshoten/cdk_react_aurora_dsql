import * as s3 from "aws-cdk-lib/aws-s3";
import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";

/*
 * # Web 配信用バケット生成
 *
 * ## 目的
 * Web 静的アセット保管 S3 生成責務を分離する。
 */
export function createWebBucket(scope: Construct, id: string): s3.Bucket {
  return new s3.Bucket(scope, id, {
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    encryption: s3.BucketEncryption.S3_MANAGED,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    autoDeleteObjects: true,
    enforceSSL: true,
  });
}
