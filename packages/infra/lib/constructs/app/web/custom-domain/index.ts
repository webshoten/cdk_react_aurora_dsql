import { lookupHostedZone } from "@infra/lib/constructs/shared/hosted-zone/hosted-zone";
import type * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import { Construct } from "constructs";
import { createWebAliasRecord } from "./web-alias-record";

export interface WebCustomDomainConstructProps {
  baseDomain: string;
  domainName: string;
  distribution: cloudfront.Distribution;
  hostedZoneId: string;
}

/*
 * # Web カスタムドメイン接続
 *
 * ## 目的
 * Hosted Zone lookup と Route53 Alias 作成を Web カスタムドメイン責務として集約する。
 *
 * ## 補足
 * CloudFront 用 ACM 証明書は us-east-1 必須のため、この Construct では証明書作成を行わない。
 * 証明書は WebCertificateStack で作成し、Distribution 側へ受け渡す責務に分離する。
 */
export class WebCustomDomainConstruct extends Construct {
  constructor(scope: Construct, id: string, props: WebCustomDomainConstructProps) {
    super(scope, id);

    const hostedZone = lookupHostedZone(this, "HostedZone", {
      hostedZoneId: props.hostedZoneId,
      zoneName: props.baseDomain,
    });

    createWebAliasRecord(this, "AliasRecord", {
      domainName: props.domainName,
      distribution: props.distribution,
      hostedZone,
    });
  }
}
