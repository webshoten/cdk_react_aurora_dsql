import * as s3 from "aws-cdk-lib/aws-s3";
import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";

/*
 * # 画像バケット生成
 *
 * ## 目的
 * 11-2.data-02 用の画像保管 S3 を生成する責務を分離する。
 */
export function createImageBucket(scope: Construct, id: string): s3.Bucket {
  return new s3.Bucket(scope, id, {
    autoDeleteObjects: true,
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    cors: [
      {
        allowedHeaders: ["*"],
        allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD, s3.HttpMethods.PUT],
        allowedOrigins: ["*"],
      },
    ],
    encryption: s3.BucketEncryption.S3_MANAGED,
    enforceSSL: true,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    versioned: false,
  });
}
