import { StorageConstruct } from "@infra/lib/constructs/app/storage";
import type { SharedLookupValues } from "@infra/lib/constructs/shared/lookup";
import { SharedLookupConstruct } from "@infra/lib/constructs/shared/lookup";
import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";

export interface StorageStackProps extends cdk.StackProps {
  resourcePrefix: string;
  sharedEnv: string;
  stage: string;
}

/*
 * # Storage Stack 構築
 *
 * ## 目的
 * stage ごとのストレージ層 Stack。11-2.data-02 で利用する画像用 S3 を管理する。
 *
 * ## 説明
 * - 現時点は image/ プレフィックス用途のみを対象にする。
 * - 将来の Firehose / 動画処理連携は本 Stack で拡張する前提。
 */
export class StorageStack extends cdk.Stack {
  public readonly imageBucketName: string;
  public readonly imagePrefix: string;

  constructor(scope: Construct, id: string, props: StorageStackProps) {
    super(scope, id, props);

    const sharedConfig: SharedLookupValues = new SharedLookupConstruct(this, "SharedLookup", {
      sharedEnv: props.sharedEnv,
    });

    cdk.Tags.of(this).add("SharedContractVersion", sharedConfig.contractVersion);
    cdk.Tags.of(this).add("SharedEnv", sharedConfig.sharedEnv);

    const storage = new StorageConstruct(this, "Storage", {
      resourcePrefix: props.resourcePrefix,
    });

    this.imageBucketName = storage.imageBucket.bucketName;
    this.imagePrefix = storage.imagePrefix;

    new cdk.CfnOutput(this, "ImageBucketName", {
      value: this.imageBucketName,
      description: "Image S3 bucket name (11-2)",
    });

    new cdk.CfnOutput(this, "ImagePrefix", {
      value: this.imagePrefix,
      description: "Image key prefix",
    });
  }
}
