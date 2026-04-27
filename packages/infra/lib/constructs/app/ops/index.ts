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

/*
 * # マイグレーション実行基盤作成（Migration / Seed ファイル保管 S3 + 実行 Lambda）
 *
 * ## 目的
 * scripts/migrate.ts から手動 invoke される migration Lambda 一式を構築する。
 *
 * ## 説明
 * - S3 バケット: 運用 CLI が Migration / Seed SQL の zip をアップロードする保管場所。オブジェクトキーは固定（current/migration-seed.zip）で、実行のたびに上書き更新する想定。
 * - Lambda: ARTIFACT_S3_BUCKET / KEY を環境変数で受け、起動時に S3 から zip を取得して /tmp 展開→ migration / seed 実行。
 * - IAM: Aurora DSQL は admin ロール接続のため dsql:DbConnectAdmin 付与。S3 はオブジェクト単位で grantRead。
 * - ログ: 1 ヶ月保持、stack destroy で削除。
 *
 * ## NOTE
 * - DSQL_DATABASE / DSQL_DB_USER ハードコード（postgres / admin）。GraphQL Lambda と二重定義。
 * - timeout 30 秒。マイグレーション件数増・サイズ増で不足する可能性。
 * - autoDeleteObjects + RemovalPolicy.DESTROY。stage 破棄前提。本番運用 stage では要見直し。
 */
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
