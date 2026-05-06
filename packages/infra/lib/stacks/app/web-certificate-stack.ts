import { WebCertificateConstruct } from "@infra/lib/constructs/app/web-certificate";
import type { SharedLookupValues } from "@infra/lib/constructs/shared/lookup";
import { SharedLookupConstruct } from "@infra/lib/constructs/shared/lookup";
import type * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";

export interface WebCertificateStackProps extends cdk.StackProps {
  sharedEnv: string;
  stage: string;
}

/*
 * # Web カスタムドメイン証明書 Stack
 *
 * ## 目的
 * CloudFront 用 ACM 証明書（us-east-1 必須）を stage 単位で管理し、WebStack へ参照を渡す。
 */
export class WebCertificateStack extends cdk.Stack {
  public readonly certificate: acm.Certificate;
  public readonly webDomainName: string;

  constructor(scope: Construct, id: string, props: WebCertificateStackProps) {
    super(scope, id, props);

    const sharedConfig: SharedLookupValues = new SharedLookupConstruct(this, "SharedLookup", {
      sharedEnv: props.sharedEnv,
    });
    const webCertificate = new WebCertificateConstruct(this, "WebCertificate", {
      baseDomain: sharedConfig.baseDomain,
      hostedZoneId: sharedConfig.hostedZoneId,
      stage: props.stage,
    });
    this.webDomainName = webCertificate.webDomainName;
    this.certificate = webCertificate.certificate;
  }
}
