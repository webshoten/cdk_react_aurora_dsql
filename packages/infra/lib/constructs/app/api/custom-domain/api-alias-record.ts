import type * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import type { Construct } from "constructs";

export interface CreateApiAliasRecordInput {
  domainName: string;
  apiDomain: apigwv2.DomainName;
  hostedZone: route53.IHostedZone;
}

/*
 * # API カスタムドメイン Alias 作成
 *
 * ## 目的
 * `api.<stage>.<base>` を API Gateway カスタムドメインへ名前解決する Route53 レコードを作成する。
 */
export function createApiAliasRecord(
  scope: Construct,
  id: string,
  input: CreateApiAliasRecordInput,
): void {
  const aliasTarget = route53.RecordTarget.fromAlias(
    new targets.ApiGatewayv2DomainProperties(
      input.apiDomain.regionalDomainName,
      input.apiDomain.regionalHostedZoneId,
    ),
  );

  new route53.ARecord(scope, `${id}A`, {
    zone: input.hostedZone,
    recordName: input.domainName,
    target: aliasTarget,
  });

  new route53.AaaaRecord(scope, `${id}AAAA`, {
    zone: input.hostedZone,
    recordName: input.domainName,
    target: aliasTarget,
  });
}
