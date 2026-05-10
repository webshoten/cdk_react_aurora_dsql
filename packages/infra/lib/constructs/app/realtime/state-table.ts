import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";

export interface RealtimeStateTableConstructProps {
  resourcePrefix: string;
}

/*
 * # Realtime State Table Construct
 *
 * ## 目的
 * IoT event の room / patient state を upsert 保存する DynamoDB テーブルを構築する。
 */
export class RealtimeStateTableConstruct extends Construct {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: RealtimeStateTableConstructProps) {
    super(scope, id);

    this.table = new dynamodb.Table(this, "IotStateTable", {
      tableName: `${props.resourcePrefix}-iot-state`,
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
