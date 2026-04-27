import { DbConstruct } from "@infra/lib/constructs/app/db";
import type { SharedLookupValues } from "@infra/lib/constructs/shared/lookup";
import { SharedLookupConstruct } from "@infra/lib/constructs/shared/lookup";
import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";

export interface DbStackProps extends cdk.StackProps {
  sharedEnv: string;
  stage: string;
  resourcePrefix: string;
}

/*
 * # Aurora DSQL Stack 構築
 *
 * ## 目的
 * stage 単位で Aurora DSQL クラスタを 1 つ立てる Stack。SharedLookup → タグ → DB 本体の順で組み立て、上位（Api・Ops Stack）が参照する ARN / endpoint / identifier を公開する。
 *
 * ## 説明
 * - SSM 参照は Stack scope が必要なため SharedLookup はこの Stack 先頭で生やす。共有契約バージョンを SharedContractVersion タグで全リソースに刻む。
 * - Db 本体は DbConstruct に委譲。Stack 側は Output 公開とタグ付けに専念。
 * - ARN / endpoint / identifier の 3 値を CfnOutput でも公開し、cdk-outputs.json から運用 CLI が参照できるようにする。
 */
export class DbStack extends cdk.Stack {
  public readonly clusterArn: string;
  public readonly endpoint: string;
  public readonly identifier: string;

  constructor(scope: Construct, id: string, props: DbStackProps) {
    super(scope, id, props);

    const sharedConfig: SharedLookupValues = new SharedLookupConstruct(this, "SharedLookup", {
      sharedEnv: props.sharedEnv,
    });

    cdk.Tags.of(this).add("SharedContractVersion", sharedConfig.contractVersion);
    cdk.Tags.of(this).add("SharedEnv", sharedConfig.sharedEnv);

    const db = new DbConstruct(this, "Db", {
      resourcePrefix: props.resourcePrefix,
      stage: props.stage,
    });

    this.clusterArn = db.clusterArn;
    this.endpoint = db.endpoint;
    this.identifier = db.identifier;

    new cdk.CfnOutput(this, "DsqlClusterArn", {
      value: this.clusterArn,
      description: "Aurora DSQL cluster ARN",
    });

    new cdk.CfnOutput(this, "DsqlEndpoint", {
      value: this.endpoint,
      description: "Aurora DSQL endpoint",
    });

    new cdk.CfnOutput(this, "DsqlClusterIdentifier", {
      value: this.identifier,
      description: "Aurora DSQL cluster identifier",
    });
  }
}
