import { lookupHostedZone } from "@infra/lib/constructs/shared/hosted-zone/hosted-zone";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as ses from "aws-cdk-lib/aws-ses";
import type { Construct } from "constructs";

export interface CreateSesIdentityInput {
  baseDomain: string;
  hostedZoneId: string;
  identityDomain: string;
}

/*
 * # SES Identity 作成
 *
 * ## 目的
 * 送信ドメイン identity を作成し、Cognito 連携に必要な ARN を提供する。
 */
export function createSesIdentity(
  scope: Construct,
  id: string,
  input: CreateSesIdentityInput,
): ses.EmailIdentity {
  const hostedZone = lookupHostedZone(scope, `${id}HostedZone`, {
    hostedZoneId: input.hostedZoneId,
    zoneName: input.baseDomain,
  });

  const identity = new ses.EmailIdentity(scope, id, {
    identity: ses.Identity.domain(input.identityDomain),
  });

  // dkimDnsTokenName* は FQDN のため、末尾ドット付き絶対名で Route53 に渡す。
  // 末尾ドットなしの FQDN を渡すと zone 名が再付与され、二重連結になる場合がある。
  new route53.CnameRecord(scope, `${id}DkimRecord1`, {
    zone: hostedZone,
    recordName: `${identity.dkimDnsTokenName1}.`,
    domainName: identity.dkimDnsTokenValue1,
  });
  new route53.CnameRecord(scope, `${id}DkimRecord2`, {
    zone: hostedZone,
    recordName: `${identity.dkimDnsTokenName2}.`,
    domainName: identity.dkimDnsTokenValue2,
  });
  new route53.CnameRecord(scope, `${id}DkimRecord3`, {
    zone: hostedZone,
    recordName: `${identity.dkimDnsTokenName3}.`,
    domainName: identity.dkimDnsTokenValue3,
  });

  return identity;
}
