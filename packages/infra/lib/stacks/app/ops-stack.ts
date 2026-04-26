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
