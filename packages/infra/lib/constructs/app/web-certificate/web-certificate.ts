import { lookupHostedZone } from "@infra/lib/constructs/shared/hosted-zone/hosted-zone";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import type { Construct } from "constructs";

export interface CreateWebCertificateInput {
  baseDomain: string;
  domainName: string;
  hostedZoneId: string;
}

/*
 * # Web 証明書作成
 *
 * ## 目的
 * Web カスタムドメイン向け ACM 証明書を DNS 検証で作成する。
 */
export function createWebCertificate(
  scope: Construct,
  id: string,
  input: CreateWebCertificateInput,
): acm.Certificate {
  const hostedZone = lookupHostedZone(scope, `${id}HostedZone`, {
    hostedZoneId: input.hostedZoneId,
    zoneName: input.baseDomain,
  });

  return new acm.Certificate(scope, id, {
    domainName: input.domainName,
    validation: acm.CertificateValidation.fromDns(hostedZone),
  });
}
