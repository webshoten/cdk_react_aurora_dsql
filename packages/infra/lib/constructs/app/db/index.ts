import * as dsql from "aws-cdk-lib/aws-dsql";
import { Construct } from "constructs";

export interface DbConstructProps {
  resourcePrefix: string;
  stage: string;
}

/*
 * # Aurora DSQL クラスタ作成
 *
 * ## 目的
 * stage ごとに Aurora DSQL クラスタを 1 つ立て、ARN / エンドポイント / 識別子を上位（Api・Ops Stack）へ公開する。
 *
 * ## 説明
 * L1 (CfnCluster) を直接利用。L2 はこの時点で未提供。
 * deletionProtectionEnabled は false。stage が破棄前提のため stack destroy で消える設計。
 *
 * ## NOTE
 * - 本番運用 stage を導入する場合は deletionProtectionEnabled の引数化が必要。
 */
export class DbConstruct extends Construct {
  public readonly clusterArn: string;
  public readonly endpoint: string;
  public readonly identifier: string;

  constructor(scope: Construct, id: string, props: DbConstructProps) {
    super(scope, id);

    const cluster = new dsql.CfnCluster(this, "Cluster", {
      deletionProtectionEnabled: false,
      tags: [
        { key: "Name", value: `${props.resourcePrefix}-db` },
        { key: "Stage", value: props.stage },
      ],
    });
    this.clusterArn = cluster.attrResourceArn;
    this.endpoint = cluster.attrEndpoint;
    this.identifier = cluster.attrIdentifier;
  }
}
