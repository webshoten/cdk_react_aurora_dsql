import { SharedMetaConstruct } from "@infra/lib/constructs/shared/meta";
import { SharedSesConstruct } from "@infra/lib/constructs/shared/ses";
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
 * - shared メタ情報は SharedMetaConstruct、SES 連携情報は SharedSesConstruct へ責務分離する。
 * - CONTRACT_VERSION は class 静的定数。App 側コードと共有契約のバージョンを揃えるための pin。
 *
 * ## NOTE
 * - SharedEnv Output の description が "Placeholder shared stack for future shared resources" のまま。共有リソースが増えたら更新候補。
 */
export class SharedStack extends cdk.Stack {
  public static readonly CONTRACT_VERSION = "1";

  constructor(scope: Construct, id: string, props: SharedStackProps) {
    super(scope, id, props);

    new SharedMetaConstruct(this, "Meta", {
      sharedEnv: props.sharedEnv,
      contractVersion: SharedStack.CONTRACT_VERSION,
    });

    const sharedSes = new SharedSesConstruct(this, "Ses", {
      sharedEnv: props.sharedEnv,
    });

    new cdk.CfnOutput(this, "SharedEnv", {
      value: props.sharedEnv,
      description: "Placeholder shared stack for future shared resources",
    });

    new cdk.CfnOutput(this, "SharedContractVersion", {
      value: SharedStack.CONTRACT_VERSION,
      description: "Shared contract version",
    });

    new cdk.CfnOutput(this, "SesFromEmail", {
      value: sharedSes.fromEmail,
      description: "SES from email used by Cognito",
    });
  }
}
