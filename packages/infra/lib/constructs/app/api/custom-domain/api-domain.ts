import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import type * as acm from "aws-cdk-lib/aws-certificatemanager";
import type { Construct } from "constructs";

export interface CreateApiDomainInput {
  api: apigwv2.HttpApi;
  certificate: acm.ICertificate;
  domainName: string;
}

/*
 * # API ドメイン接続
 *
 * ## 目的
 * API Gateway DomainName と ApiMapping を作成して API 本体へ接続する。
 */
export function createApiDomain(
  scope: Construct,
  id: string,
  input: CreateApiDomainInput,
): apigwv2.DomainName {
  const apiDomain = new apigwv2.DomainName(scope, `${id}DomainName`, {
    domainName: input.domainName,
    certificate: input.certificate,
  });

  new apigwv2.ApiMapping(scope, `${id}ApiMapping`, {
    api: input.api,
    domainName: apiDomain,
  });

  return apiDomain;
}
