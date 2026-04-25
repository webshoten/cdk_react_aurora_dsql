import { ApiConstruct } from "@infra/lib/constructs/app/api";
import type { SharedLookupValues } from "@infra/lib/constructs/shared/lookup";
import { SharedLookupConstruct } from "@infra/lib/constructs/shared/lookup";
import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";

export interface ApiStackProps extends cdk.StackProps {
  dbClusterArn: string;
  dbEndpoint: string;
  stage: string;
  resourcePrefix: string;
  sharedEnv: string;
}

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
