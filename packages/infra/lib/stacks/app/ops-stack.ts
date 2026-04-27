import { OpsConstruct } from "@infra/lib/constructs/app/ops";
import type { SharedLookupValues } from "@infra/lib/constructs/shared/lookup";
import { SharedLookupConstruct } from "@infra/lib/constructs/shared/lookup";
import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";

export interface OpsStackProps extends cdk.StackProps {
  dbClusterArn: string;
  dbEndpoint: string;
  resourcePrefix: string;
  sharedEnv: string;
  stage: string;
}

/*
 * # マイグレーション実行基盤 Stack 構築
 *
 * ## 目的
 * stage ごとの Ops 層 Stack。マイグレーション資材保管 S3 と migration Lambda を OpsConstruct に委譲し、運用 CLI が参照する Output を公開する。
 *
 * ## 説明
 * - SSM 参照は Stack scope が必要なため SharedLookup をここで作る。
 * - Stack に SharedContractVersion / SharedEnv タグを付与し、共有契約のバージョンと環境名を CFN リソースに横串で残す。
 * - 公開する 4 値（バケット名・オブジェクトキー・関数 ARN・関数名）は cdk-outputs.json 経由で scripts/migrate.ts から参照される。
 */
export class OpsStack extends cdk.Stack {
  public readonly migrationArtifactBucketName: string;
  public readonly migrationArtifactObjectKey: string;
  public readonly migrationRunnerFunctionArn: string;
  public readonly migrationRunnerFunctionName: string;

  constructor(scope: Construct, id: string, props: OpsStackProps) {
    super(scope, id, props);

    const sharedConfig: SharedLookupValues = new SharedLookupConstruct(this, "SharedLookup", {
      sharedEnv: props.sharedEnv,
    });

    cdk.Tags.of(this).add("SharedContractVersion", sharedConfig.contractVersion);
    cdk.Tags.of(this).add("SharedEnv", sharedConfig.sharedEnv);

    const ops = new OpsConstruct(this, "Ops", {
      dbClusterArn: props.dbClusterArn,
      dbEndpoint: props.dbEndpoint,
      sharedEnv: props.sharedEnv,
      stage: props.stage,
    });

    this.migrationArtifactBucketName = ops.migrationArtifactBucketName;
    this.migrationArtifactObjectKey = ops.migrationArtifactObjectKey;
    this.migrationRunnerFunctionArn = ops.migrationRunnerFunctionArn;
    this.migrationRunnerFunctionName = ops.migrationRunnerFunctionName;

    new cdk.CfnOutput(this, "MigrationArtifactBucketName", {
      value: this.migrationArtifactBucketName,
      description: "Migration artifact S3 bucket name",
    });

    new cdk.CfnOutput(this, "MigrationArtifactObjectKey", {
      value: this.migrationArtifactObjectKey,
      description: "Migration artifact S3 object key",
    });

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
