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
