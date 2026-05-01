import * as ssm from "aws-cdk-lib/aws-ssm";
import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";

export interface ClientIdNameMapConstructProps {
  sharedEnv: string;
  stage: string;
  userPoolClientId: string;
}

/*
 * # Cognito clientId -> clientName マップの SSM 管理
 *
 * ## 目的
 * preAuthentication trigger で受け取る clientId を意味名（web など）へ解決するための参照データを、
 * stage 単位の SSM Parameter として作成する。
 *
 * ## 説明
 * - parameter 名は `/pf/app/<sharedEnv>/<stage>/auth/client-id-name-map` 固定。
 * - 値は JSON 文字列（`{"<clientId>":"web"}`）で保持する。
 * - UserPoolClientId は deploy 時に確定するため、Fn.toJsonString でトークンを含む JSON を構築する。
 *
 * ## NOTE
 * - 現時点は Web client のみを登録。client が増えた場合は map エントリを拡張する。
 */
export class ClientIdNameMapConstruct extends Construct {
  public readonly parameterName: string;

  constructor(scope: Construct, id: string, props: ClientIdNameMapConstructProps) {
    super(scope, id);

    this.parameterName = `/pf/app/${props.sharedEnv}/${props.stage}/auth/client-id-name-map`;

    const parameter = new ssm.StringParameter(this, "Parameter", {
      parameterName: this.parameterName,
      stringValue: cdk.Fn.toJsonString({
        [props.userPoolClientId]: "web",
      }),
    });
    parameter.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
  }
}
