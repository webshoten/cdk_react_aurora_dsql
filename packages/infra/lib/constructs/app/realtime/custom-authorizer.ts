import * as path from "node:path";
import * as iam from "aws-cdk-lib/aws-iam";
import * as iot from "aws-cdk-lib/aws-iot";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";

export interface RealtimeCustomAuthorizerConstructProps {
  resourcePrefix: string;
  sharedEnv: string;
  stage: string;
  userPoolClientId: string;
  userPoolId: string;
}

/*
 * # Realtime Custom Authorizer Construct
 *
 * ## 目的
 * リアルタイム配信責務の接続認可入口として、IoT custom authorizer と実行 Lambda を構築する。
 */
export class RealtimeCustomAuthorizerConstruct extends Construct {
  public readonly authorizer: iot.CfnAuthorizer;
  public readonly authorizerFunction: NodejsFunction;

  constructor(scope: Construct, id: string, props: RealtimeCustomAuthorizerConstructProps) {
    super(scope, id);

    this.authorizerFunction = new NodejsFunction(this, "Function", {
      entry: path.join(
        __dirname,
        "../../../../../functions/src/handlers/auth/iot-authorizer/index.ts",
      ),
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "handler",
      memorySize: 256,
      timeout: cdk.Duration.seconds(5),
      environment: {
        COGNITO_REGION: cdk.Stack.of(this).region,
        USER_POOL_ID: props.userPoolId,
        USER_POOL_CLIENT_ID: props.userPoolClientId,
        AWS_ACCOUNT_ID: cdk.Stack.of(this).account,
        IOT_SHARED_ENV: props.sharedEnv,
        IOT_STAGE: props.stage,
      },
    });

    this.authorizer = new iot.CfnAuthorizer(this, "Resource", {
      authorizerFunctionArn: this.authorizerFunction.functionArn,
      authorizerName: `${props.resourcePrefix}-realtime-custom-authorizer`,
      signingDisabled: true,
      status: "ACTIVE",
      tokenKeyName: "token",
      enableCachingForHttp: false,
    });

    this.authorizerFunction.addPermission("AllowIotInvoke", {
      principal: new iam.ServicePrincipal("iot.amazonaws.com"),
      action: "lambda:InvokeFunction",
      sourceArn: this.authorizer.attrArn,
    });
  }
}
