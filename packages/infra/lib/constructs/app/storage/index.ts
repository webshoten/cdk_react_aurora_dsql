import * as s3 from "aws-cdk-lib/aws-s3";
import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";

export interface StorageConstructProps {
  resourcePrefix: string;
}

/*
 * # ストレージ基盤作成（11-2 画像用 S3）
 *
 * ## 目的
 * 11-2.data-02 で利用する画像アップロード先を専用 S3 として用意する。
 *
 * ## 説明
 * - 現時点の運用対象は image/ プレフィックス配下のみ。
 * - stage 破棄時に残置しないため DESTROY + autoDeleteObjects を採用。
 */
export class StorageConstruct extends Construct {
  public readonly imageBucket: s3.Bucket;
  public readonly imagePrefix: string;

  constructor(scope: Construct, id: string, _props: StorageConstructProps) {
    super(scope, id);

    this.imagePrefix = "image/";

    this.imageBucket = new s3.Bucket(this, "ImageBucket", {
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
}
