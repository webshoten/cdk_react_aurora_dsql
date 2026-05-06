import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import type { Construct } from "constructs";

export interface CreateApiGatewayInput {
  allowOrigins: string[];
  resourcePrefix: string;
}

/*
 * # HTTP API 生成
 *
 * ## 目的
 * ApiConstruct から API Gateway（HttpApi）生成責務を分離する。
 */
export function createApiGateway(
  scope: Construct,
  id: string,
  input: CreateApiGatewayInput,
): apigwv2.HttpApi {
  return new apigwv2.HttpApi(scope, id, {
    apiName: `${input.resourcePrefix}-api`,
    corsPreflight: {
      allowMethods: [apigwv2.CorsHttpMethod.GET, apigwv2.CorsHttpMethod.POST],
      allowHeaders: ["Content-Type", "Authorization"],
      allowOrigins: input.allowOrigins,
    },
  });
}
