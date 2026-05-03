import * as iam from "aws-cdk-lib/aws-iam";
import * as path from "node:path";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import * as cdk from "aws-cdk-lib/core";
import type * as s3 from "aws-cdk-lib/aws-s3";
import type { Construct } from "constructs";

export interface CreateMigrationFunctionInput {
  artifactBucket: s3.Bucket;
  artifactObjectKey: string;
  dbClusterArn: string;
  dbEndpoint: string;
  sharedEnv: string;
  stage: string;
}

/*
 * # MigrationRunner function 生成
 *
 * ## 目的
 * migration 実行 Lambda 生成責務を分離する。
 */
export function createMigrationFunction(
  scope: Construct,
  id: string,
  input: CreateMigrationFunctionInput,
): NodejsFunction {
  const migrationRunnerFunction = new NodejsFunction(scope, id, {
    entry: path.join(__dirname, "../../../../../functions/src/handlers/migration/index.ts"),
    runtime: lambda.Runtime.NODEJS_24_X,
    handler: "handler",
    memorySize: 256,
    timeout: cdk.Duration.seconds(30),
    logGroup: new logs.LogGroup(scope, "MigrationRunnerFunctionLogGroup", {
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    }),
    bundling: {
      minify: true,
      nodeModules: ["@aws-sdk/client-s3", "@aws-sdk/dsql-signer", "fflate", "pg"],
      sourceMap: true,
      esbuildArgs: {
        "--sources-content": "false",
      },
    },
    environment: {
      ARTIFACT_S3_BUCKET: input.artifactBucket.bucketName,
      ARTIFACT_S3_KEY: input.artifactObjectKey,
      DSQL_CLUSTER_ARN: input.dbClusterArn,
      DSQL_DATABASE: "postgres",
      DSQL_DB_USER: "admin",
      DSQL_ENDPOINT: input.dbEndpoint,
      DSQL_PORT: "5432",
      DSQL_REGION: cdk.Stack.of(scope).region,
      MIGRATIONS_SCHEMA: "public",
      MIGRATIONS_TABLE: "pf_migration_files",
      NODE_OPTIONS: "--enable-source-maps",
      SHARED_ENV: input.sharedEnv,
      STAGE: input.stage,
    },
  });

  migrationRunnerFunction.addToRolePolicy(
    new iam.PolicyStatement({
      actions: ["dsql:DbConnectAdmin"],
      resources: [input.dbClusterArn],
    }),
  );
  input.artifactBucket.grantRead(migrationRunnerFunction, input.artifactObjectKey);

  return migrationRunnerFunction;
}
