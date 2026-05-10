import * as iam from "aws-cdk-lib/aws-iam";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as cr from "aws-cdk-lib/custom-resources";
import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";

export interface SharedIotEndpointConstructProps {
  sharedEnv: string;
}

/*
 * # IoT Data endpoint shared 取得 Construct
 *
 * ## 目的
 * AWS IoT Data endpoint（iot:Data-ATS）を shared 層で 1 回だけ取得し、SSM に格納して app stack 群へ公開する。
 *
 * ## 説明
 * - IoT Data endpoint はアカウント+リージョンで一意・固定値。app stack ごとに iot:DescribeEndpoint を呼ぶと API クォータ（10 TPS）を消費するため shared 層で集約する。
 * - 取得は AwsCustomResource で onCreate/onUpdate に describeEndpoint を割り当てる。read-only API なので onDelete は定義せず、stack 削除時の副作用なし。
 * - 取得値は /pf/shared/<sharedEnv>/iot/data-endpoint に格納し、SharedLookupConstruct から SSM 参照する。
 */
export class SharedIotEndpointConstruct extends Construct {
  public readonly parameterName: string;

  constructor(scope: Construct, id: string, props: SharedIotEndpointConstructProps) {
    super(scope, id);

    const describeIotEndpoint = new cr.AwsCustomResource(this, "DescribeEndpoint", {
      onCreate: {
        service: "Iot",
        action: "describeEndpoint",
        parameters: { endpointType: "iot:Data-ATS" },
        physicalResourceId: cr.PhysicalResourceId.of(`iot-data-endpoint-${props.sharedEnv}`),
      },
      onUpdate: {
        service: "Iot",
        action: "describeEndpoint",
        parameters: { endpointType: "iot:Data-ATS" },
        physicalResourceId: cr.PhysicalResourceId.of(`iot-data-endpoint-${props.sharedEnv}`),
      },
      policy: cr.AwsCustomResourcePolicy.fromStatements([
        new iam.PolicyStatement({
          actions: ["iot:DescribeEndpoint"],
          resources: ["*"],
        }),
      ]),
      // iot:DescribeEndpoint は Lambda ビルトイン AWS SDK に古くから含まれるため、最新 SDK の同梱は不要。コールドスタート短縮のため明示的に false 指定する。
      installLatestAwsSdk: false,
    });

    this.parameterName = `/pf/shared/${props.sharedEnv}/iot/data-endpoint`;

    const param = new ssm.StringParameter(this, "DataEndpointParameter", {
      parameterName: this.parameterName,
      stringValue: describeIotEndpoint.getResponseField("endpointAddress"),
    });
    param.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
  }
}
