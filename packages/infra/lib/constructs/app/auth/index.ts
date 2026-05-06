import * as cognito from "aws-cdk-lib/aws-cognito";
import * as cognitoIdentity from "aws-cdk-lib/aws-cognito-identitypool";
import { ClientIdNameMapConstruct } from "@infra/lib/constructs/app/auth/client-id-name-map";
import { createIdentityPool } from "@infra/lib/constructs/app/auth/identity-pool";
import { AuthTriggerConstruct } from "@infra/lib/constructs/app/auth/triggers";
import { createUserPool } from "@infra/lib/constructs/app/auth/user-pool";
import { createWebUserPoolClient } from "@infra/lib/constructs/app/auth/web-user-pool-client";
import { Construct } from "constructs";

export interface AuthConstructProps {
  resourcePrefix: string;
  sharedEnv: string;
  sesFromEmail: string;
  sesFromEmailArn: string;
  stage: string;
}

/*
 * # 認証基盤 Construct
 *
 * ## 目的
 * Cognito 認証基盤（UserPool / Client / IdentityPool）を一体で構築する。
 *
 * ## 説明
 * UserPool trigger 接続と clientId マップ SSM 作成までを同一 Construct で完結させる。
 */
export class AuthConstruct extends Construct {
  public readonly userPool: cognito.UserPool;
  public readonly webUserPoolClient: cognito.UserPoolClient;
  public readonly identityPool: cognitoIdentity.IdentityPool;
  public readonly clientIdNameMapParameterName: string;

  constructor(scope: Construct, id: string, props: AuthConstructProps) {
    super(scope, id);

    this.userPool = createUserPool(this, "UserPool", {
      resourcePrefix: props.resourcePrefix,
      sesFromEmail: props.sesFromEmail,
      sesFromEmailArn: props.sesFromEmailArn,
    });

    new AuthTriggerConstruct(this, "Triggers", {
      userPool: this.userPool,
    });

    this.webUserPoolClient = createWebUserPoolClient(this, "WebUserPoolClient", {
      resourcePrefix: props.resourcePrefix,
      userPool: this.userPool,
    });

    this.identityPool = createIdentityPool(this, "IdentityPool", {
      resourcePrefix: props.resourcePrefix,
      userPool: this.userPool,
      webUserPoolClient: this.webUserPoolClient,
    });

    const clientIdNameMap = new ClientIdNameMapConstruct(this, "ClientIdNameMap", {
      sharedEnv: props.sharedEnv,
      stage: props.stage,
      userPoolClientId: this.webUserPoolClient.userPoolClientId,
    });
    this.clientIdNameMapParameterName = clientIdNameMap.parameterName;
  }
}
