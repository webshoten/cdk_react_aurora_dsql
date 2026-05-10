import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

export interface SharedUsEast1LookupConstructProps {
  sharedEnv: string;
}

export interface SharedUsEast1LookupValues {
  contractVersion: string;
  sharedEnv: string;
  sesFromEmail: string;
  sesFromEmailArn: string;
  baseDomain: string;
  hostedZoneId: string;
}

/*
 * # us-east-1 用 shared SSM 参照
 *
 * ## 目的
 * CloudFront 証明書 stack（us-east-1）で必要な shared 契約値のみを参照する。
 *
 * ## 説明
 * us-east-1 には `/pf/shared/<sharedEnv>/{meta,domain,ses}/*` のみ同期されるため、
 * iot/data-endpoint は参照対象に含めない。
 */
export class SharedUsEast1LookupConstruct extends Construct implements SharedUsEast1LookupValues {
  public readonly contractVersion: string;
  public readonly sharedEnv: string;
  public readonly sesFromEmail: string;
  public readonly sesFromEmailArn: string;
  public readonly baseDomain: string;
  public readonly hostedZoneId: string;

  constructor(scope: Construct, id: string, props: SharedUsEast1LookupConstructProps) {
    super(scope, id);

    const prefix = `/pf/shared/${props.sharedEnv}/meta`;
    const sesPrefix = `/pf/shared/${props.sharedEnv}/ses`;
    const domainPrefix = `/pf/shared/${props.sharedEnv}/domain`;

    this.sharedEnv = ssm.StringParameter.valueForStringParameter(this, `${prefix}/sharedEnv`);
    this.contractVersion = ssm.StringParameter.valueForStringParameter(
      this,
      `${prefix}/contractVersion`,
    );
    this.sesFromEmail = ssm.StringParameter.valueForStringParameter(this, `${sesPrefix}/fromEmail`);
    this.sesFromEmailArn = ssm.StringParameter.valueForStringParameter(
      this,
      `${sesPrefix}/fromEmailArn`,
    );
    this.baseDomain = ssm.StringParameter.valueForStringParameter(
      this,
      `${domainPrefix}/baseDomain`,
    );
    this.hostedZoneId = ssm.StringParameter.valueForStringParameter(
      this,
      `${domainPrefix}/hostedZoneId`,
    );
  }
}

