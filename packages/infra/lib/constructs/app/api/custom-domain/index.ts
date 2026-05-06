import { lookupHostedZone } from "@infra/lib/constructs/shared/hosted-zone/hosted-zone";
import type * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import { Construct } from "constructs";
import { createApiAliasRecord } from "./api-alias-record";
import { createApiCertificate } from "./api-certificate";
import { createApiDomain } from "./api-domain";

export interface ApiCustomDomainConstructProps {
  api: apigwv2.HttpApi;
  baseDomain: string;
  domainName: string;
  hostedZoneId: string;
}

/*
 * # API カスタムドメイン接続
 *
 * ## 目的
 * ACM 証明書・API Gateway DomainName/ApiMapping・Route53 Alias 作成を API カスタムドメイン責務として集約する。
 */
export class ApiCustomDomainConstruct extends Construct {
  public readonly apiDomain: apigwv2.DomainName;

  constructor(scope: Construct, id: string, props: ApiCustomDomainConstructProps) {
    super(scope, id);

    const hostedZone = lookupHostedZone(this, "HostedZone", {
      hostedZoneId: props.hostedZoneId,
      zoneName: props.baseDomain,
    });

    const certificate = createApiCertificate(this, "Certificate", {
      domainName: props.domainName,
      hostedZone,
    });

    this.apiDomain = createApiDomain(this, "Domain", {
      api: props.api,
      certificate,
      domainName: props.domainName,
    });

    createApiAliasRecord(this, "AliasRecord", {
      domainName: props.domainName,
      apiDomain: this.apiDomain,
      hostedZone,
    });
  }
}
