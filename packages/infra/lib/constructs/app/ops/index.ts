import { createMigrationBucket } from "@infra/lib/constructs/app/ops/migration-bucket";
import { createMigrationFunction } from "@infra/lib/constructs/app/ops/migration-function";
import { Construct } from "constructs";

export interface OpsConstructProps {
  dbClusterArn: string;
  dbEndpoint: string;
  sharedEnv: string;
  stage: string;
}

/*
 * # マイグレーション実行基盤作成（Migration / Seed SQL zip 保管 S3 + 実行 Lambda）
 *
 * ## 目的
 * scripts/migrate.ts から手動 invoke される migration Lambda 一式を構築する。
 *
 * ## 説明
 * - S3 バケット: 運用 CLI が Migration / Seed SQL の zip をアップロードする保管場所。オブジェクトキーは固定（current/migration-seed.zip）で、実行のたびに上書き更新する想定。
 * - Lambda: ARTIFACT_S3_BUCKET / KEY（識別子名）を環境変数で受け、起動時に S3 から SQL zip を取得して /tmp 展開→ migration / seed 実行。
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

    const migrationArtifactBucket = createMigrationBucket(this, "MigrationArtifactBucket");

    const migrationFn = createMigrationFunction(this, "MigrationRunnerFunction", {
      artifactBucket: migrationArtifactBucket,
      artifactObjectKey: migrationArtifactObjectKey,
      dbClusterArn: props.dbClusterArn,
      dbEndpoint: props.dbEndpoint,
      sharedEnv: props.sharedEnv,
      stage: props.stage,
    });

    this.migrationArtifactBucketName = migrationArtifactBucket.bucketName;
    this.migrationArtifactObjectKey = migrationArtifactObjectKey;
    this.migrationRunnerFunctionArn = migrationFn.functionArn;
    this.migrationRunnerFunctionName = migrationFn.functionName;
  }
}
