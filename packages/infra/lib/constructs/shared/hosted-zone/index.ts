import * as ssm from "aws-cdk-lib/aws-ssm";
import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import { lookupHostedZone, resolveHostedZoneInput } from "./hosted-zone";

export interface SharedHostedZoneConstructProps {
  sharedEnv: string;
}

/*
 * # shared Hosted Zone 構成
 *
 * ## 目的
 * Base domain を shared パラメータへ公開し、Hosted Zone 参照を共通入口で提供する。
 */
export class SharedHostedZoneConstruct extends Construct {
  public readonly baseDomain: string;
  public readonly hostedZoneId: string;

  constructor(scope: Construct, id: string, props: SharedHostedZoneConstructProps) {
    super(scope, id);

    const hostedZoneInput = resolveHostedZoneInput(this, {
      sharedEnv: props.sharedEnv,
    });
    this.baseDomain = hostedZoneInput.zoneName;
    this.hostedZoneId = hostedZoneInput.hostedZoneId;

    const sharedDomainPrefix = `/pf/shared/${props.sharedEnv}/domain`;
    const baseDomainParam = new ssm.StringParameter(this, "BaseDomainParameter", {
      parameterName: `${sharedDomainPrefix}/baseDomain`,
      stringValue: this.baseDomain,
    });
    baseDomainParam.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    const hostedZoneIdParam = new ssm.StringParameter(this, "HostedZoneIdParameter", {
      parameterName: `${sharedDomainPrefix}/hostedZoneId`,
      stringValue: this.hostedZoneId,
    });
    hostedZoneIdParam.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
  }

  /*
   * # Hosted Zone 参照
   *
   * ## 目的
   * baseDomain を使った Hosted Zone lookup を同一責務内で提供する。
   */
  public hostedZone(id: string) {
    return lookupHostedZone(this, id, {
      hostedZoneId: this.hostedZoneId,
      zoneName: this.baseDomain,
    });
  }
}
