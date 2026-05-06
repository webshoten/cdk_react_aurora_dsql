import * as route53 from "aws-cdk-lib/aws-route53";
import * as ssm from "aws-cdk-lib/aws-ssm";
import type { Construct } from "constructs";

export interface LookupHostedZoneInput {
  hostedZoneId: string;
  zoneName: string;
}

export interface ResolveHostedZoneInput {
  sharedEnv: string;
}

/*
 * # Hosted Zone lookup
 *
 * ## 目的
 * Hosted Zone ID/Name の確定値から Hosted Zone 参照を作成する。
 */
export function lookupHostedZone(
  scope: Construct,
  id: string,
  input: LookupHostedZoneInput,
): route53.IHostedZone {
  return route53.HostedZone.fromHostedZoneAttributes(scope, id, {
    hostedZoneId: input.hostedZoneId,
    zoneName: input.zoneName,
  });
}

/*
 * # Hosted Zone 入力値解決
 *
 * ## 目的
 * CD 入力パラメータ（`HOSTED_ZONE_ID` / `HOSTED_ZONE_NAME`）を shared 側で参照する。
 */
export function resolveHostedZoneInput(scope: Construct, input: ResolveHostedZoneInput): LookupHostedZoneInput {
  return {
    hostedZoneId: ssm.StringParameter.valueForStringParameter(
      scope,
      `/pf/cd/${input.sharedEnv}/env/HOSTED_ZONE_ID`,
    ),
    zoneName: ssm.StringParameter.valueForStringParameter(
      scope,
      `/pf/cd/${input.sharedEnv}/env/HOSTED_ZONE_NAME`,
    ),
  };
}
