import { AuthConstruct } from "@infra/lib/constructs/app/auth";
import type { SharedLookupValues } from "@infra/lib/constructs/shared/lookup";
import { SharedLookupConstruct } from "@infra/lib/constructs/shared/lookup";
import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";

export interface AuthStackProps extends cdk.StackProps {
  sharedEnv: string;
  stage: string;
  resourcePrefix: string;
}

/*
 * # Auth Stack
 *
 * ## 目的
 * 認証基盤リソースを stack 単位で構築し、他 stack へ参照値を公開する。
 *
 * ## 説明
 * SharedLookup で共有設定を解決し、AuthConstruct の出力値を CfnOutput と public readonly プロパティで公開する。
 */
export class AuthStack extends cdk.Stack {
  public readonly userPoolId: string;
  public readonly userPoolClientId: string;
  public readonly clientIdNameMapParameterName: string;

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);

    const sharedConfig: SharedLookupValues = new SharedLookupConstruct(this, "SharedLookup", {
      sharedEnv: props.sharedEnv,
    });

    cdk.Tags.of(this).add("SharedContractVersion", sharedConfig.contractVersion);
    cdk.Tags.of(this).add("SharedEnv", sharedConfig.sharedEnv);

    const auth = new AuthConstruct(this, "Auth", {
      resourcePrefix: props.resourcePrefix,
      sharedEnv: props.sharedEnv,
      sesFromEmail: sharedConfig.sesFromEmail,
      sesFromEmailArn: sharedConfig.sesFromEmailArn,
      stage: props.stage,
    });

    this.userPoolId = auth.userPool.userPoolId;
    this.userPoolClientId = auth.webUserPoolClient.userPoolClientId;
    this.clientIdNameMapParameterName = auth.clientIdNameMapParameterName;

    new cdk.CfnOutput(this, "UserPoolId", { value: this.userPoolId });
    new cdk.CfnOutput(this, "UserPoolClientId", { value: this.userPoolClientId });
    new cdk.CfnOutput(this, "IdentityPoolId", { value: auth.identityPool.identityPoolId });
    new cdk.CfnOutput(this, "ClientIdNameMapParameterName", {
      value: this.clientIdNameMapParameterName,
    });
  }
}
