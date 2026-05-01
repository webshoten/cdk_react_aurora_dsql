import * as path from "node:path";
import * as authorizers from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";

export interface GraphqlAuthorizerConstructProps {
  userPoolClientId: string;
}

/*
 * # GraphQL Authorizer Construct
 *
 * ## 目的
 * /graphql 用の Lambda Authorizer を構築する。
 *
 * ## 説明
 * Authorizer Lambda と HttpLambdaAuthorizer を生成し、Api Construct から参照できる形で公開する。
 */
export class GraphqlAuthorizerConstruct extends Construct {
  public readonly authorizer: authorizers.HttpLambdaAuthorizer;

  constructor(scope: Construct, id: string, props: GraphqlAuthorizerConstructProps) {
    super(scope, id);

    const authorizerFn = new NodejsFunction(this, "Function", {
      entry: path.join(__dirname, "../../../../../functions/src/handlers/auth/authorizer/index.ts"),
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "handler",
      memorySize: 256,
      timeout: cdk.Duration.seconds(5),
      environment: {
        COGNITO_REGION: cdk.Stack.of(this).region,
        USER_POOL_CLIENT_ID: props.userPoolClientId,
      },
    });

    this.authorizer = new authorizers.HttpLambdaAuthorizer("HttpAuthorizer", authorizerFn, {
      responseTypes: [authorizers.HttpLambdaResponseType.SIMPLE],
    });
  }
}
