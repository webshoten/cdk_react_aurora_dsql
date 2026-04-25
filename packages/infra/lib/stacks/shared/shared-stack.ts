import * as ssm from "aws-cdk-lib/aws-ssm";
import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";

export interface SharedStackProps extends cdk.StackProps {
  sharedEnv: string;
}

export class SharedStack extends cdk.Stack {
  public static readonly CONTRACT_VERSION = "1";

  constructor(scope: Construct, id: string, props: SharedStackProps) {
    super(scope, id, props);

    const ssmPrefix = `/pf/shared/${props.sharedEnv}/meta`;

    const sharedEnvParam = new ssm.StringParameter(this, "SharedEnvParameter", {
      parameterName: `${ssmPrefix}/sharedEnv`,
      stringValue: props.sharedEnv,
    });
    sharedEnvParam.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    const contractVersionParam = new ssm.StringParameter(this, "ContractVersionParameter", {
      parameterName: `${ssmPrefix}/contractVersion`,
      stringValue: SharedStack.CONTRACT_VERSION,
    });
    contractVersionParam.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    new cdk.CfnOutput(this, "SharedEnv", {
      value: props.sharedEnv,
      description: "Placeholder shared stack for future shared resources",
    });

    new cdk.CfnOutput(this, "SharedContractVersion", {
      value: SharedStack.CONTRACT_VERSION,
      description: "Shared contract version",
    });
  }
}
