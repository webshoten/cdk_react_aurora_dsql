import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import { Construct } from "constructs";
import { GraphqlApiConstruct } from "./graphql";

export interface ApiConstructProps {
  dbClusterArn: string;
  dbEndpoint: string;
  resourcePrefix: string;
  sharedEnv: string;
  stage: string;
}

/*
 * # API 層構成（HTTP API + GraphQL ルート紐付け）
 *
 * ## 目的
 * stage ごとの API 層エントリ。HttpApi（API Gateway v2）を 1 本立て、配下の GraphQL ルートまで紐付けて apiUrl を公開する。
 *
 * ## 説明
 * - CORS は Content-Type / Authorization、GET/POST、全オリジン許可。dev / prod 区別なく緩い設定。
 * - 配下に GraphqlApiConstruct を 1 個生やし /graphql を取り付ける。将来エンドポイントが増えるならここに足す想定。
 * - apiUrl は WebStack 側で参照して Web ビルドに渡す。
 *
 * ## NOTE
 * - allowOrigins ワイルドカード。本番でドメイン固定したい場合は引数化必要。
 */
export class ApiConstruct extends Construct {
  public readonly apiUrl: string;
  public readonly httpApi: apigwv2.HttpApi;

  constructor(scope: Construct, id: string, props: ApiConstructProps) {
    super(scope, id);

    this.httpApi = new apigwv2.HttpApi(this, "HttpApi", {
      apiName: `${props.resourcePrefix}-api`,
      corsPreflight: {
        allowMethods: [apigwv2.CorsHttpMethod.GET, apigwv2.CorsHttpMethod.POST],
        allowHeaders: ["Content-Type", "Authorization"],
        allowOrigins: ["*"],
      },
    });

    new GraphqlApiConstruct(this, "Graphql", {
      dbClusterArn: props.dbClusterArn,
      dbEndpoint: props.dbEndpoint,
      httpApi: this.httpApi,
      sharedEnv: props.sharedEnv,
      stage: props.stage,
    });

    this.apiUrl = this.httpApi.apiEndpoint;
  }
}
