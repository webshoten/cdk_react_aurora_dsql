import { RealtimeConstruct } from "@infra/lib/constructs/app/realtime";
import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";

export interface RealtimeStackProps extends cdk.StackProps {
  resourcePrefix: string;
  sharedEnv: string;
  stage: string;
  userPoolClientId: string;
  userPoolId: string;
}

/*
 * # Realtime Stack
 *
 * ## 目的
 * リアルタイム配信責務の認可リソースを stack 単位で構築し、他 stack から参照できる値を公開する。
 *
 * ## 説明
 * - IoT Data endpoint の取得は管理しない。SharedStack の SharedIotEndpointConstruct が SSM 経由で公開する値を app stack 側から参照する。
 *   理由: IoT Data endpoint はアカウント+リージョンで一意・固定であり、app stack 単位で取得すると重複と iot:DescribeEndpoint クォータ消費を招くため、shared 層で 1 回だけ取得して再利用する。
 */
export class RealtimeStack extends cdk.Stack {
  public readonly realtimeCustomAuthorizerName: string;
  public readonly realtimeIotStateTableName: string;
  public readonly realtimeEventSubscriberFunctionName: string;
  public readonly realtimeEventTopicRuleName: string;

  constructor(scope: Construct, id: string, props: RealtimeStackProps) {
    super(scope, id, props);

    const realtime = new RealtimeConstruct(this, "Realtime", {
      resourcePrefix: props.resourcePrefix,
      sharedEnv: props.sharedEnv,
      stage: props.stage,
      userPoolClientId: props.userPoolClientId,
      userPoolId: props.userPoolId,
    });

    this.realtimeCustomAuthorizerName = realtime.customAuthorizerName;
    this.realtimeIotStateTableName = realtime.iotStateTableName;
    this.realtimeEventSubscriberFunctionName = realtime.subscriberFunctionName;
    this.realtimeEventTopicRuleName = realtime.eventTopicRuleName;

    new cdk.CfnOutput(this, "RealtimeCustomAuthorizerName", {
      value: this.realtimeCustomAuthorizerName,
    });
    new cdk.CfnOutput(this, "RealtimeIotStateTableName", {
      value: this.realtimeIotStateTableName,
    });
    new cdk.CfnOutput(this, "RealtimeEventSubscriberFunctionName", {
      value: this.realtimeEventSubscriberFunctionName,
    });
    new cdk.CfnOutput(this, "RealtimeEventTopicRuleName", {
      value: this.realtimeEventTopicRuleName,
    });
  }
}
