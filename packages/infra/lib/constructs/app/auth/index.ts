import * as cognito from "aws-cdk-lib/aws-cognito";
import * as cognitoIdentity from "aws-cdk-lib/aws-cognito-identitypool";
import { ClientIdNameMapConstruct } from "@infra/lib/constructs/app/auth/client-id-name-map";
import { AuthTriggerConstruct } from "@infra/lib/constructs/app/auth/triggers";
import { Construct } from "constructs";

export interface AuthConstructProps {
  resourcePrefix: string;
  sharedEnv: string;
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

    this.userPool = new cognito.UserPool(this, "UserPool", {
      selfSignUpEnabled: true,
      signInAliases: {
        username: true,
        email: true,
      },
      userPoolName: `${props.resourcePrefix}-user-pool`,
      customAttributes: {
        institution_id: new cognito.StringAttribute({
          minLen: 1,
          maxLen: 10,
          mutable: true,
        }),
        mfa_preference: new cognito.StringAttribute({
          minLen: 1,
          maxLen: 16,
          mutable: true,
        }),
      },
      mfa: cognito.Mfa.OPTIONAL,
      mfaSecondFactor: {
        otp: true,
        sms: true,
      },
    });

    new AuthTriggerConstruct(this, "Triggers", {
      userPool: this.userPool,
    });

    this.webUserPoolClient = this.userPool.addClient("WebUserPoolClient", {
      authFlows: {
        userSrp: true,
        userPassword: true,
      },
      userPoolClientName: `${props.resourcePrefix}-web-client`,
      // generateSecret（公開クライアント）はデフォルトでfalse、SPA標準   関連：packages/web/public/config.js
    });

    this.identityPool = new cognitoIdentity.IdentityPool(this, "IdentityPool", {
      allowClassicFlow: false,
      allowUnauthenticatedIdentities: false,
      authenticationProviders: {
        userPools: [
          new cognitoIdentity.UserPoolAuthenticationProvider({
            userPoolClient: this.webUserPoolClient,
            userPool: this.userPool,
          }),
        ],
      },
      identityPoolName: `${props.resourcePrefix}-identity-pool`,
    });

    const clientIdNameMap = new ClientIdNameMapConstruct(this, "ClientIdNameMap", {
      sharedEnv: props.sharedEnv,
      stage: props.stage,
      userPoolClientId: this.webUserPoolClient.userPoolClientId,
    });
    this.clientIdNameMapParameterName = clientIdNameMap.parameterName;
  }
}
