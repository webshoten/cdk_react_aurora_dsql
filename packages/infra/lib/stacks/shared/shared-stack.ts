import * as ssm from "aws-cdk-lib/aws-ssm";
import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";

export interface SharedStackProps extends cdk.StackProps {
  sharedEnv: string;
}

/*
 * # 共有層 Stack 構築（環境ごと長命リソース）
 *
 * ## 目的
 * sharedEnv 単位で 1 つだけ立つ共有層 Stack。App 系 Stack（Db / Api / Ops / Web）が SSM 経由で参照する共通契約値を保持する。
 *
 * ## 説明
 * - 今は sharedEnv と contractVersion を SSM パラメータとして配置するのみ。将来共通リソースが増えたらここに足す。
 * - CONTRACT_VERSION は class 静的定数。App 側コードと共有契約のバージョンを揃えるための pin。
 * - パラメータ自体は applyRemovalPolicy(DESTROY) を明示。Stack 削除で SSM パラメータも消える。
 *
 * ## NOTE
 * - SharedEnv Output の description が "Placeholder shared stack for future shared resources" のまま。共有リソースが増えたら更新候補。
 */
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
