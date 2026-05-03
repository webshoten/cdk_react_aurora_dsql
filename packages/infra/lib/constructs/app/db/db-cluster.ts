import * as dsql from "aws-cdk-lib/aws-dsql";
import type { Construct } from "constructs";

export interface CreateDbClusterInput {
  resourcePrefix: string;
  stage: string;
}

/*
 * # Aurora DSQL Cluster 生成
 *
 * ## 目的
 * DbConstruct から DSQL クラスタ生成責務を分離する。
 */
export function createDbCluster(
  scope: Construct,
  id: string,
  input: CreateDbClusterInput,
): dsql.CfnCluster {
  return new dsql.CfnCluster(scope, id, {
    deletionProtectionEnabled: false,
    tags: [
      { key: "Name", value: `${input.resourcePrefix}-db` },
      { key: "Stage", value: input.stage },
    ],
  });
}
