import * as path from "node:path";
import type { SharedLookupValues } from "@infra/lib/constructs/shared/lookup";
import { SharedLookupConstruct } from "@infra/lib/constructs/shared/lookup";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";

export interface OpsStackProps extends cdk.StackProps {
  dbClusterArn: string;
  dbEndpoint: string;
  resourcePrefix: string;
  sharedEnv: string;
  stage: string;
}

export class OpsStack extends cdk.Stack {
  public readonly migrationRunnerFunctionArn: string;
  public readonly migrationRunnerFunctionName: string;

  constructor(scope: Construct, id: string, props: OpsStackProps) {
    super(scope, id, props);
    const packagesDir = path.join(__dirname, "../../../../");
    const migrationsSourceDir = path.join(packagesDir, "core/src/db/migrations");
    const seedsSourceDir = path.join(packagesDir, "core/src/db/seeds");

    const sharedConfig: SharedLookupValues = new SharedLookupConstruct(this, "SharedLookup", {
      sharedEnv: props.sharedEnv,
    });

    cdk.Tags.of(this).add("SharedContractVersion", sharedConfig.contractVersion);
    cdk.Tags.of(this).add("SharedEnv", sharedConfig.sharedEnv);

    const migrationFn = new NodejsFunction(this, "MigrationRunnerFunction", {
      entry: path.join(packagesDir, "functions/src/handlers/migration/index.ts"),
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "handler",
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
      logGroup: new logs.LogGroup(this, "MigrationRunnerFunctionLogGroup", {
        retention: logs.RetentionDays.ONE_MONTH,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }),
      bundling: {
        commandHooks: {
          beforeBundling() {
            return [];
          },
          beforeInstall() {
            return [];
          },
          afterBundling(_inputDir: string, outputDir: string) {
            return [
              `mkdir -p ${outputDir}/db/migrations`,
              `cp -R ${migrationsSourceDir}/. ${outputDir}/db/migrations`,
              `mkdir -p ${outputDir}/db/seeds`,
              `cp -R ${seedsSourceDir}/. ${outputDir}/db/seeds`,
            ];
          },
        },
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
        MIGRATIONS_DIR: "/var/task/db/migrations",
        MIGRATIONS_SCHEMA: "public",
        MIGRATIONS_TABLE: "pf_migration_files",
        NODE_OPTIONS: "--enable-source-maps",
        SEEDS_DIR: "/var/task/db/seeds",
        SHARED_ENV: props.sharedEnv,
        STAGE: props.stage,
      },
    });

    migrationFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["dsql:DbConnectAdmin"],
        resources: [props.dbClusterArn],
      }),
    );

    this.migrationRunnerFunctionArn = migrationFn.functionArn;
    this.migrationRunnerFunctionName = migrationFn.functionName;

    new cdk.CfnOutput(this, "MigrationRunnerFunctionName", {
      value: this.migrationRunnerFunctionName,
      description: "MigrationRunner Lambda function name",
    });

    new cdk.CfnOutput(this, "MigrationRunnerFunctionArn", {
      value: this.migrationRunnerFunctionArn,
      description: "MigrationRunner Lambda function ARN",
    });
  }
}
