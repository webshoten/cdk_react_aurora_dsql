import * as cognito from "aws-cdk-lib/aws-cognito";
import type { Construct } from "constructs";

export interface CreateUserPoolInput {
  resourcePrefix: string;
  sesFromEmail: string;
}

/*
 * # UserPool 生成
 *
 * ## 目的
 * AuthConstruct から UserPool 生成責務を分離する。
 */
export function createUserPool(scope: Construct, id: string, input: CreateUserPoolInput): cognito.UserPool {
  const userPool = new cognito.UserPool(scope, id, {
    selfSignUpEnabled: true,
    signInAliases: {
      username: true,
      email: true,
    },
    userPoolName: `${input.resourcePrefix}-user-pool`,
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
    email: cognito.UserPoolEmail.withSES({
      fromEmail: input.sesFromEmail,
    }),
  });

  const cfnUserPool = userPool.node.defaultChild as cognito.CfnUserPool;
  cfnUserPool.enabledMfas = ["EMAIL_OTP", "SMS_MFA", "SOFTWARE_TOKEN_MFA"];
  return userPool;
}
