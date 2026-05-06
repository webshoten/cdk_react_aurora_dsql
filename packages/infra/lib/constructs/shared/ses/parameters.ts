import * as ssm from "aws-cdk-lib/aws-ssm";
import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";

export interface PublishSharedSesParametersInput {
  sharedEnv: string;
  fromEmail: string;
  fromEmailArn: string;
}

/*
 * # shared SES パラメータ公開
 *
 * ## 目的
 * App stack が参照する SES 共通値を `/pf/shared/<env>/ses/*` に公開する。
 */
export function publishSharedSesParameters(
  scope: Construct,
  id: string,
  input: PublishSharedSesParametersInput,
): void {
  const sharedSesPrefix = `/pf/shared/${input.sharedEnv}/ses`;

  const fromEmailParam = new ssm.StringParameter(scope, `${id}FromEmailParameter`, {
    parameterName: `${sharedSesPrefix}/fromEmail`,
    stringValue: input.fromEmail,
  });
  fromEmailParam.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

  const fromEmailArnParam = new ssm.StringParameter(scope, `${id}FromEmailArnParameter`, {
    parameterName: `${sharedSesPrefix}/fromEmailArn`,
    stringValue: input.fromEmailArn,
  });
  fromEmailArnParam.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

}
