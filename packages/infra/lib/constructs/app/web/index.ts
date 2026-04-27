import * as path from "node:path";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";

export interface WebConstructProps {
  resourcePrefix: string;
  apiUrl: string;
}

/*
 * # Web 配信基盤作成（S3 + CloudFront + 静的アセット配置）
 *
 * ## 目的
 * Web ビルド成果物（packages/web/dist）の配信基盤を立てる。stage ごとの CloudFront ディストリビューション + 専用 S3 バケット。
 *
 * ## 説明
 * - S3 はパブリックブロック。CloudFront からは Origin Access Control 経由で取得。
 * - SPA ルーティング対応: 403/404 を /index.html に書き換えて 200 で返す。
 * - 配信物に config.js を Source.data で注入し、apiUrl を実行時に window.__CONFIG__ で供給。
 *   API URL 変更時に Web バンドルを再ビルドしなくて済むのが狙い。
 * - distributionPaths ["/*"] 指定で BucketDeployment ごとに CloudFront 全体 invalidate。
 *
 * ## NOTE
 * - autoDeleteObjects + RemovalPolicy.DESTROY。stage 破棄前提。本番運用 stage では要見直し。
 */
export class WebConstruct extends Construct {
  public readonly distributionDomain: string;

  constructor(scope: Construct, id: string, props: WebConstructProps) {
    super(scope, id);

    const bucket = new s3.Bucket(this, "WebBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      enforceSSL: true,
    });

    const distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },
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

    new s3deploy.BucketDeployment(this, "WebDeploy", {
      sources: [
        s3deploy.Source.asset(path.join(__dirname, "../../../../../web/dist")),
        s3deploy.Source.data(
          "config.js",
          `window.__CONFIG__=${JSON.stringify({
            apiUrl: props.apiUrl,
          })};`,
        ),
      ],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ["/*"],
    });

    this.distributionDomain = distribution.distributionDomainName;
  }
}
