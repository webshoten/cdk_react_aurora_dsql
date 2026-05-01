import * as path from "node:path";
import { GraphqlAuthorizerConstruct } from "@infra/lib/constructs/app/auth/authorizer";
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
  imageBucketName: string;
  imagePrefix: string;
  sharedEnv: string;
  stage: string;
  userPoolId: string;
  userPoolClientId: string;
}

/*
 * # GraphQL 用エンドポイント作成
 *
 * ## 目的
 * /graphql ルートを HttpApi に紐付け、Lambda 実体（NodejsFunction）と DSQL 接続権限を 1 ヶ所で組み立てる。
 *
 * ## 説明
 * - DSQL は admin ロール固定で接続。dsql:DbConnectAdmin を Lambda 実行ロールに付与。
 * - pg / dsql-signer は nodeModules 指定で esbuild バンドル対象から除外し node_modules 同梱で配布。
 * - source map ありビルド + NODE_OPTIONS=--enable-source-maps。CloudWatch Logs スタックトレースで TS 行表示する用途。
 * - ログ保持 1 ヶ月、stack destroy 時にロググループも削除。
 *
 * ## NOTE
 * - DSQL_DATABASE / DSQL_DB_USER をハードコード（postgres / admin）。stage ごと切替不能。
 * - timeout 10 秒。重いクエリが入ると不足する可能性。
 */
export class GraphqlApiConstruct extends Construct {
  constructor(scope: Construct, id: string, props: GraphqlApiConstructProps) {
    super(scope, id);

    const graphqlAuthorizer = new GraphqlAuthorizerConstruct(this, "GraphqlAuthorizer", {
      userPoolClientId: props.userPoolClientId,
    });

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
        nodeModules: ["@aws-sdk/client-s3", "@aws-sdk/dsql-signer", "@aws-sdk/s3-request-presigner", "pg"],
        sourceMap: true,
        esbuildArgs: {
          "--sources-content": "false",
        },
      },
      environment: {
        COGNITO_REGION: cdk.Stack.of(this).region,
        DSQL_DATABASE: "postgres",
        DSQL_DB_USER: "admin",
        DSQL_CLUSTER_ARN: props.dbClusterArn,
        DSQL_ENDPOINT: props.dbEndpoint,
        DSQL_PORT: "5432",
        DSQL_REGION: cdk.Stack.of(this).region,
        IMAGE_BUCKET: props.imageBucketName,
        IMAGE_PREFIX: props.imagePrefix,
        NODE_OPTIONS: "--enable-source-maps",
        PRESIGNED_URL_EXPIRES_SECONDS: "300",
        SHARED_ENV: props.sharedEnv,
        STAGE: props.stage,
        USER_POOL_ID: props.userPoolId,
      },
    });

    graphqlFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["dsql:DbConnectAdmin"],
        resources: [props.dbClusterArn],
      }),
    );

    graphqlFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject", "s3:PutObject"],
        resources: [`arn:aws:s3:::${props.imageBucketName}/${props.imagePrefix}*`],
      }),
    );

    graphqlFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          "cognito-idp:AdminCreateUser",
          "cognito-idp:AdminGetUser",
          "cognito-idp:AdminSetUserPassword",
        ],
        resources: [
          cdk.Stack.of(this).formatArn({
            service: "cognito-idp",
            resource: "userpool",
            resourceName: props.userPoolId,
          }),
        ],
      }),
    );

    props.httpApi.addRoutes({
      path: "/graphql",
      methods: [apigwv2.HttpMethod.GET, apigwv2.HttpMethod.POST],
      integration: new integrations.HttpLambdaIntegration("GraphqlIntegration", graphqlFn),
      authorizer: graphqlAuthorizer.authorizer,
    });
  }
}
