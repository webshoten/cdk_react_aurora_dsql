import type * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import { Construct } from "constructs";
import { createApiGateway } from "./api-gateway";
import { ApiCustomDomainConstruct } from "./custom-domain";
import { GraphqlApiConstruct } from "./graphql";

export interface ApiConstructProps {
  dbClusterArn: string;
  dbEndpoint: string;
  imageBucketName: string;
  imagePrefix: string;
  resourcePrefix: string;
  sharedEnv: string;
  stage: string;
  userPoolId: string;
  userPoolClientId: string;
  baseDomain: string;
  customDomainName: string;
  hostedZoneId: string;
}

/*
 * # API 層構成（HTTP API + GraphQL ルート紐付け）
 *
 * ## 目的
 * stage ごとの API 層エントリ。HttpApi（API Gateway v2）を 1 本立て、配下の GraphQL ルートまで紐付けて apiUrl を公開する。
 *
 * ## 説明
 * - CORS は Content-Type / Authorization、GET/POST、`https://web.<stage>.<baseDomain>` とローカル開発 Origin に限定する。
 * - 配下に GraphqlApiConstruct を 1 個生やし /graphql を取り付ける。将来エンドポイントが増えるならここに足す想定。
 * - apiUrl は WebStack 側で参照して Web ビルドに渡す。
 * - API カスタムドメイン（証明書/DomainName/ApiMapping/Alias）は同一 compose 内で接続する。
 *
 */
export class ApiConstruct extends Construct {
  public readonly apiUrl: string;
  public readonly httpApi: apigwv2.HttpApi;

  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);

    this.httpApi = createApiGateway(this, "HttpApi", {
      allowOrigins: [`https://web.${props.stage}.${props.baseDomain}`, "http://localhost:5173"],
      resourcePrefix: props.resourcePrefix,
    });

    new GraphqlApiConstruct(this, "Graphql", {
      dbClusterArn: props.dbClusterArn,
      dbEndpoint: props.dbEndpoint,
      httpApi: this.httpApi,
      imageBucketName: props.imageBucketName,
      imagePrefix: props.imagePrefix,
      sharedEnv: props.sharedEnv,
      stage: props.stage,
      userPoolClientId: props.userPoolClientId,
      userPoolId: props.userPoolId,
    });

    new ApiCustomDomainConstruct(this, "CustomDomain", {
      api: this.httpApi,
      baseDomain: props.baseDomain,
      domainName: props.customDomainName,
      hostedZoneId: props.hostedZoneId,
    });

    this.apiUrl = this.httpApi.apiEndpoint;
  }
}
