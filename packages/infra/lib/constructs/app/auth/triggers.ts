import * as path from "node:path";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";

export interface AuthTriggerConstructProps {
  userPool: cognito.UserPool;
}

/*
 * # UserPool Trigger Construct
 *
 * ## 目的
 * Cognito UserPool の trigger Lambda を作成し、対象イベントへ接続する。
 *
 * ## 説明
 * preAuthentication / preTokenGeneration / customMessage の3 trigger を一括で定義する。
 */
export class AuthTriggerConstruct extends Construct {
  constructor(scope: Construct, id: string, props: AuthTriggerConstructProps) {
    super(scope, id);

    const preAuthenticationTrigger = new NodejsFunction(this, "PreAuthenticationTrigger", {
      entry: path.join(
        __dirname,
        "../../../../../functions/src/handlers/auth/triggers/pre-authentication/index.ts",
      ),
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "handler",
      memorySize: 256,
      timeout: cdk.Duration.seconds(5),
    });

    const preTokenGenerationTrigger = new NodejsFunction(this, "PreTokenGenerationTrigger", {
      entry: path.join(
        __dirname,
        "../../../../../functions/src/handlers/auth/triggers/pre-token-generation/index.ts",
      ),
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "handler",
      memorySize: 256,
      timeout: cdk.Duration.seconds(5),
    });

    const customMessageTrigger = new NodejsFunction(this, "CustomMessageTrigger", {
      entry: path.join(
        __dirname,
        "../../../../../functions/src/handlers/auth/triggers/custom-message/index.ts",
      ),
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "handler",
      memorySize: 256,
      timeout: cdk.Duration.seconds(5),
    });

    props.userPool.addTrigger(cognito.UserPoolOperation.PRE_AUTHENTICATION, preAuthenticationTrigger);
    props.userPool.addTrigger(cognito.UserPoolOperation.PRE_TOKEN_GENERATION, preTokenGenerationTrigger);
    props.userPool.addTrigger(cognito.UserPoolOperation.CUSTOM_MESSAGE, customMessageTrigger);
  }
}
