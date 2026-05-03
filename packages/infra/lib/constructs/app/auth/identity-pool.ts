import * as cognito from "aws-cdk-lib/aws-cognito";
import * as cognitoIdentity from "aws-cdk-lib/aws-cognito-identitypool";
import type { Construct } from "constructs";

export interface CreateIdentityPoolInput {
  resourcePrefix: string;
  userPool: cognito.UserPool;
  webUserPoolClient: cognito.UserPoolClient;
}

/*
 * # IdentityPool 生成
 *
 * ## 目的
 * AuthConstruct から IdentityPool 生成責務を分離する。
 */
export function createIdentityPool(
  scope: Construct,
  id: string,
  input: CreateIdentityPoolInput,
): cognitoIdentity.IdentityPool {
  return new cognitoIdentity.IdentityPool(scope, id, {
    allowClassicFlow: false,
    allowUnauthenticatedIdentities: false,
    authenticationProviders: {
      userPools: [
        new cognitoIdentity.UserPoolAuthenticationProvider({
          userPoolClient: input.webUserPoolClient,
          userPool: input.userPool,
        }),
      ],
    },
    identityPoolName: `${input.resourcePrefix}-identity-pool`,
  });
}
