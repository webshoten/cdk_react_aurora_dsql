import { WebConstruct } from "@infra/lib/constructs/app/web";
import type { SharedLookupValues } from "@infra/lib/constructs/shared/lookup";
import { SharedLookupConstruct } from "@infra/lib/constructs/shared/lookup";
import type * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";

export interface WebStackProps extends cdk.StackProps {
  apiUrl: string;
  userPoolId: string;
  userPoolClientId: string;
  sharedEnv: string;
  stage: string;
  resourcePrefix: string;
  webCertificate: acm.ICertificate;
}

/*
 * # Web 配信 Stack 構築
 *
 * ## 目的
 * stage ごとの Web 層 Stack。S3 + CloudFront による静的アセット配信を WebConstruct に委譲し、配信 URL を Output で公開する。
 *
 * ## 説明
 * - SSM 参照は Stack scope が必要なため SharedLookup をここで作る。
 * - Stack に SharedContractVersion / SharedEnv タグを付与し、共有契約のバージョンと環境名を CFN リソースに横串で残す。
 * - apiUrl は ApiStack から prop で受け取り、WebConstruct 内で config.js に注入される。
 */
export class WebStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WebStackProps) {
    super(scope, id, props);

    const sharedConfig: SharedLookupValues = new SharedLookupConstruct(this, "SharedLookup", {
      sharedEnv: props.sharedEnv,
    });

    cdk.Tags.of(this).add("SharedContractVersion", sharedConfig.contractVersion);
    cdk.Tags.of(this).add("SharedEnv", sharedConfig.sharedEnv);
    const webDomainName = `web.${props.stage}.${sharedConfig.baseDomain}`;

    const web = new WebConstruct(this, "Web", {
      resourcePrefix: props.resourcePrefix,
      baseDomain: sharedConfig.baseDomain,
      hostedZoneId: sharedConfig.hostedZoneId,
      apiUrl: props.apiUrl,
      cognitoRegion: cdk.Stack.of(this).region,
      userPoolId: props.userPoolId,
      userPoolClientId: props.userPoolClientId,
      customDomainCertificate: props.webCertificate,
      customDomainName: webDomainName,
    });

    new cdk.CfnOutput(this, "WebUrl", {
      value: `https://${web.distributionDomain}`,
      description: "CloudFront distribution URL",
    });

    new cdk.CfnOutput(this, "WebCustomDomainName", {
      value: webDomainName,
      description: "Web custom domain name",
    });
  }
}
