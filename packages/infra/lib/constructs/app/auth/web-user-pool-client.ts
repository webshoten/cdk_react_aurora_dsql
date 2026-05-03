import * as cognito from "aws-cdk-lib/aws-cognito";
import type { Construct } from "constructs";

export interface CreateWebUserPoolClientInput {
  resourcePrefix: string;
  userPool: cognito.UserPool;
}

/*
 * # Web UserPoolClient 生成
 *
 * ## 目的
 * AuthConstruct から Web UserPoolClient 生成責務を分離する。
 */
export function createWebUserPoolClient(
  scope: Construct,
  id: string,
  input: CreateWebUserPoolClientInput,
): cognito.UserPoolClient {
  return input.userPool.addClient(id, {
    authFlows: {
      userSrp: true,
      userPassword: true,
    },
    userPoolClientName: `${input.resourcePrefix}-web-client`,
    // generateSecret（公開クライアント）はデフォルトでfalse、SPA標準   関連：packages/web/public/config.js
  });
}
