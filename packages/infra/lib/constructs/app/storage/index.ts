import { createImageBucket } from "@infra/lib/constructs/app/storage/image-bucket";
import { IMAGE_PREFIX } from "@infra/lib/constructs/app/storage/image-prefix";
import * as s3 from "aws-cdk-lib/aws-s3";
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

    this.imagePrefix = IMAGE_PREFIX;
    this.imageBucket = createImageBucket(this, "ImageBucket");
  }
}
