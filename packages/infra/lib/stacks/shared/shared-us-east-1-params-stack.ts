import * as ssm from "aws-cdk-lib/aws-ssm";
import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";

export interface SharedUsEast1ParamsStackProps extends cdk.StackProps {
  sharedEnv: string;
  contractVersion: string;
  baseDomain: string;
  hostedZoneId: string;
  sesFromEmail: string;
  sesFromEmailArn: string;
}

/*
 * # Shared us-east-1 パラメータ Stack
 *
 * ## 目的
 * us-east-1 で参照される shared 契約値を SSM に同期配置する。
 */
export class SharedUsEast1ParamsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SharedUsEast1ParamsStackProps) {
    super(scope, id, props);

    const metaPrefix = `/pf/shared/${props.sharedEnv}/meta`;
    const domainPrefix = `/pf/shared/${props.sharedEnv}/domain`;
    const sesPrefix = `/pf/shared/${props.sharedEnv}/ses`;

    new ssm.StringParameter(this, "MetaSharedEnvParameter", {
      parameterName: `${metaPrefix}/sharedEnv`,
      stringValue: props.sharedEnv,
    });
    new ssm.StringParameter(this, "MetaContractVersionParameter", {
      parameterName: `${metaPrefix}/contractVersion`,
      stringValue: props.contractVersion,
    });
    new ssm.StringParameter(this, "DomainBaseDomainParameter", {
      parameterName: `${domainPrefix}/baseDomain`,
      stringValue: props.baseDomain,
    });
    new ssm.StringParameter(this, "DomainHostedZoneIdParameter", {
      parameterName: `${domainPrefix}/hostedZoneId`,
      stringValue: props.hostedZoneId,
    });
    new ssm.StringParameter(this, "SesFromEmailParameter", {
      parameterName: `${sesPrefix}/fromEmail`,
      stringValue: props.sesFromEmail,
    });
    new ssm.StringParameter(this, "SesFromEmailArnParameter", {
      parameterName: `${sesPrefix}/fromEmailArn`,
      stringValue: props.sesFromEmailArn,
    });
  }
}
