import { RealtimeCustomAuthorizerConstruct } from "@infra/lib/constructs/app/realtime/custom-authorizer";
import { RealtimeStateTableConstruct } from "@infra/lib/constructs/app/realtime/state-table";
import { RealtimeTopicRuleSubscriberConstruct } from "@infra/lib/constructs/app/realtime/topic-rule-subscriber";
import type * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export interface RealtimeConstructProps {
  resourcePrefix: string;
  sharedEnv: string;
  stage: string;
  userPoolClientId: string;
  userPoolId: string;
}

/*
 * # Realtime Construct
 *
 * ## 目的
 * リアルタイム配信責務の認可リソースを集約し、stack 側へ公開する。
 */
export class RealtimeConstruct extends Construct {
  public readonly customAuthorizerName: string;
  public readonly iotStateTable: dynamodb.ITable;
  public readonly iotStateTableName: string;
  public readonly subscriberFunctionName: string;
  public readonly eventTopicRuleName: string;

  constructor(scope: Construct, id: string, props: RealtimeConstructProps) {
    super(scope, id);

    const stateTable = new RealtimeStateTableConstruct(this, "StateTable", {
      resourcePrefix: props.resourcePrefix,
    });

    const customAuthorizer = new RealtimeCustomAuthorizerConstruct(this, "CustomAuthorizer", props);
    const subscriber = new RealtimeTopicRuleSubscriberConstruct(this, "TopicRuleSubscriber", {
      iotStateTable: stateTable.table,
      sharedEnv: props.sharedEnv,
      stage: props.stage,
    });

    this.customAuthorizerName = customAuthorizer.authorizer.authorizerName ?? "";
    this.iotStateTable = stateTable.table;
    this.iotStateTableName = stateTable.table.tableName;
    this.subscriberFunctionName = subscriber.subscriberFunction.functionName;
    this.eventTopicRuleName = subscriber.topicRule.ruleName ?? "";
  }
}
