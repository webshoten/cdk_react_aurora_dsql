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
