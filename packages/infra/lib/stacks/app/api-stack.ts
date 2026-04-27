import { ApiConstruct } from "@infra/lib/constructs/app/api";
import type { SharedLookupValues } from "@infra/lib/constructs/shared/lookup";
import { SharedLookupConstruct } from "@infra/lib/constructs/shared/lookup";
import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";

export interface ApiStackProps extends cdk.StackProps {
  dbClusterArn: string;
  dbEndpoint: string;
  imageBucketName: string;
  imagePrefix: string;
  stage: string;
  resourcePrefix: string;
  sharedEnv: string;
}

/*
 * # API Stack（GraphQL API Gateway + Lambda）
 *
 * ## 目的
 * stage ごとの API 層 Stack。SSM lookup・タグ付与・API リソース構築を 1 ヶ所で完結させる入口。
 *
 * ## 説明
 * - SSM 参照は Stack scope が必要なため SharedLookup をここで作る。
 * - Stack に SharedContractVersion / SharedEnv タグを付与し、共有契約のバージョンと環境名を CFN リソースに横串で残す。
 * - API URL は WebStack に渡すため CfnOutput で公開し、apiUrl プロパティでも参照可能にする。
 */
export class ApiStack extends cdk.Stack {
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const sharedConfig: SharedLookupValues = new SharedLookupConstruct(this, "SharedLookup", {
      sharedEnv: props.sharedEnv,
    });

    cdk.Tags.of(this).add("SharedContractVersion", sharedConfig.contractVersion);
    cdk.Tags.of(this).add("SharedEnv", sharedConfig.sharedEnv);

    const api = new ApiConstruct(this, "Api", {
      dbClusterArn: props.dbClusterArn,
      dbEndpoint: props.dbEndpoint,
      imageBucketName: props.imageBucketName,
      imagePrefix: props.imagePrefix,
      resourcePrefix: props.resourcePrefix,
      sharedEnv: props.sharedEnv,
      stage: props.stage,
    });

    this.apiUrl = api.apiUrl;

    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.apiUrl,
      description: "API Gateway endpoint URL",
    });
  }
}
