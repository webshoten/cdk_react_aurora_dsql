import * as acm from "aws-cdk-lib/aws-certificatemanager";
import type * as route53 from "aws-cdk-lib/aws-route53";
import type { Construct } from "constructs";

export interface CreateApiCertificateInput {
  domainName: string;
  hostedZone: route53.IHostedZone;
}

/*
 * # API 証明書作成
 *
 * ## 目的
 * API カスタムドメイン向け ACM 証明書を DNS 検証で作成する。
 */
export function createApiCertificate(
  scope: Construct,
  id: string,
  input: CreateApiCertificateInput,
): acm.Certificate {
  return new acm.Certificate(scope, id, {
    domainName: input.domainName,
    validation: acm.CertificateValidation.fromDns(input.hostedZone),
  });
}
