import * as path from "node:path";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";

export interface GraphqlApiConstructProps {
  dbClusterArn: string;
  dbEndpoint: string;
  httpApi: apigwv2.HttpApi;
  sharedEnv: string;
  stage: string;
}

export class GraphqlApiConstruct extends Construct {
  constructor(scope: Construct, id: string, props: GraphqlApiConstructProps) {
    super(scope, id);

    const graphqlFn = new NodejsFunction(this, "GraphqlFunction", {
      entry: path.join(__dirname, "../../../../../functions/src/handlers/graphql/index.ts"),
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "handler",
      memorySize: 256,
      timeout: cdk.Duration.seconds(10),
      logGroup: new logs.LogGroup(this, "GraphqlFunctionLogGroup", {
        retention: logs.RetentionDays.ONE_MONTH,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }),
      bundling: {
        minify: true,
        nodeModules: ["@aws-sdk/dsql-signer", "pg"],
        sourceMap: true,
        esbuildArgs: {
          "--sources-content": "false",
        },
      },
      environment: {
        DSQL_DATABASE: "postgres",
        DSQL_DB_USER: "admin",
        DSQL_CLUSTER_ARN: props.dbClusterArn,
        DSQL_ENDPOINT: props.dbEndpoint,
        DSQL_PORT: "5432",
        DSQL_REGION: cdk.Stack.of(this).region,
        NODE_OPTIONS: "--enable-source-maps",
        SHARED_ENV: props.sharedEnv,
        STAGE: props.stage,
      },
    });

    graphqlFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["dsql:DbConnectAdmin"],
        resources: [props.dbClusterArn],
      }),
    );

    props.httpApi.addRoutes({
      path: "/graphql",
      methods: [apigwv2.HttpMethod.GET, apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration("GraphqlIntegration", graphqlFn),
    });
  }
}
