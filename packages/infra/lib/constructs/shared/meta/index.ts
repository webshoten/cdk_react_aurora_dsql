import * as ssm from "aws-cdk-lib/aws-ssm";
import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";

export interface SharedMetaConstructProps {
  contractVersion: string;
  sharedEnv: string;
}

/*
 * # shared メタ情報管理 Construct
 *
 * ## 目的
 * 共有契約のメタ値（sharedEnv / contractVersion）を SSM に配置する責務を分離する。
 */
export class SharedMetaConstruct extends Construct {
  constructor(scope: Construct, id: string, props: SharedMetaConstructProps) {
    super(scope, id);

    const sharedMetaPrefix = `/pf/shared/${props.sharedEnv}/meta`;

    const sharedEnvParam = new ssm.StringParameter(this, "SharedEnvParameter", {
      parameterName: `${sharedMetaPrefix}/sharedEnv`,
      stringValue: props.sharedEnv,
    });
    sharedEnvParam.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    const contractVersionParam = new ssm.StringParameter(this, "ContractVersionParameter", {
      parameterName: `${sharedMetaPrefix}/contractVersion`,
      stringValue: props.contractVersion,
    });
    contractVersionParam.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
  }
}
