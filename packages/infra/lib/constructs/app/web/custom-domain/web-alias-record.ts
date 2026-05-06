import type * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as targets from "aws-cdk-lib/aws-route53-targets";
import type { Construct } from "constructs";

export interface CreateWebAliasRecordInput {
  domainName: string;
  distribution: cloudfront.Distribution;
  hostedZone: route53.IHostedZone;
}

/*
 * # Web カスタムドメイン Alias 作成
 *
 * ## 目的
 * `web.<stage>.<base>` を CloudFront Distribution へ名前解決する Route53 レコードを作成する。
 */
export function createWebAliasRecord(
  scope: Construct,
  id: string,
  input: CreateWebAliasRecordInput,
): void {
  new route53.ARecord(scope, `${id}A`, {
    zone: input.hostedZone,
    recordName: input.domainName,
    target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(input.distribution)),
  });

  new route53.AaaaRecord(scope, `${id}AAAA`, {
    zone: input.hostedZone,
    recordName: input.domainName,
    target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(input.distribution)),
  });
}
