import * as path from "node:path";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";

export interface OpsConstructProps {
  dbClusterArn: string;
  dbEndpoint: string;
  sharedEnv: string;
  stage: string;
}

export class OpsConstruct extends Construct {
  public readonly migrationArtifactBucketName: string;
  public readonly migrationArtifactObjectKey: string;
  public readonly migrationRunnerFunctionArn: string;
  public readonly migrationRunnerFunctionName: string;

  constructor(scope: Construct, id: string, props: OpsConstructProps) {
    super(scope, id);
    const migrationArtifactObjectKey = "current/migration-seed.zip";

    const migrationArtifactBucket = new s3.Bucket(this, "MigrationArtifactBucket", {
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      versioned: false,
    });

    const migrationFn = new NodejsFunction(this, "MigrationRunnerFunction", {
      entry: path.join(__dirname, "../../../../../functions/src/handlers/migration/index.ts"),
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "handler",
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
      logGroup: new logs.LogGroup(this, "MigrationRunnerFunctionLogGroup", {
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
        ARTIFACT_S3_BUCKET: migrationArtifactBucket.bucketName,
        ARTIFACT_S3_KEY: migrationArtifactObjectKey,
        DSQL_CLUSTER_ARN: props.dbClusterArn,
        DSQL_DATABASE: "postgres",
        DSQL_DB_USER: "admin",
        DSQL_ENDPOINT: props.dbEndpoint,
        DSQL_PORT: "5432",
        DSQL_REGION: cdk.Stack.of(this).region,
        MIGRATIONS_SCHEMA: "public",
        MIGRATIONS_TABLE: "pf_migration_files",
        NODE_OPTIONS: "--enable-source-maps",
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

    migrationArtifactBucket.grantRead(migrationFn, migrationArtifactObjectKey);

    this.migrationArtifactBucketName = migrationArtifactBucket.bucketName;
    this.migrationArtifactObjectKey = migrationArtifactObjectKey;
    this.migrationRunnerFunctionArn = migrationFn.functionArn;
    this.migrationRunnerFunctionName = migrationFn.functionName;
  }
}
