import * as path from "node:path";
import type * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as iot from "aws-cdk-lib/aws-iot";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";

export interface RealtimeTopicRuleSubscriberConstructProps {
  iotStateTable: dynamodb.ITable;
  sharedEnv: string;
  stage: string;
}

/*
 * # Realtime TopicRule Subscriber Construct
 *
 * ## 目的
 * event topic を Lambda subscriber へ接続し、publish -> Lambda 発火経路を構築する。
 */
export class RealtimeTopicRuleSubscriberConstruct extends Construct {
  public readonly subscriberFunction: NodejsFunction;
  public readonly topicRule: iot.CfnTopicRule;

  constructor(scope: Construct, id: string, props: RealtimeTopicRuleSubscriberConstructProps) {
    super(scope, id);

    this.subscriberFunction = new NodejsFunction(this, "SubscriberFunction", {
      entry: path.join(
        __dirname,
        "../../../../../functions/src/handlers/realtime/iot-event-subscriber/index.ts",
      ),
      runtime: lambda.Runtime.NODEJS_24_X,
      handler: "handler",
      memorySize: 256,
      timeout: cdk.Duration.seconds(10),
      environment: {
        IOT_STATE_TABLE_NAME: props.iotStateTable.tableName,
      },
    });
    props.iotStateTable.grantReadWriteData(this.subscriberFunction);

    const eventTopicFilter = `pf/${props.sharedEnv}/${props.stage}/medicalInstitution/+/room/+/event`;
    this.topicRule = new iot.CfnTopicRule(this, "EventTopicRule", {
      ruleName: `${props.sharedEnv}_${props.stage}_event_topic_rule`,
      topicRulePayload: {
        sql: `SELECT *, topic() as receivedTopic FROM '${eventTopicFilter}'`,
        actions: [
          {
            lambda: {
              functionArn: this.subscriberFunction.functionArn,
            },
          },
        ],
      },
    });

    this.subscriberFunction.addPermission("AllowIotTopicRuleInvoke", {
      principal: new iam.ServicePrincipal("iot.amazonaws.com"),
      action: "lambda:InvokeFunction",
      sourceArn: this.topicRule.attrArn,
    });
  }
}
