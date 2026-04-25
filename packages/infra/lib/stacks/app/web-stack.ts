import { WebConstruct } from "@infra/lib/constructs/app/web";
import type { SharedLookupValues } from "@infra/lib/constructs/shared/lookup";
import { SharedLookupConstruct } from "@infra/lib/constructs/shared/lookup";
import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";

export interface WebStackProps extends cdk.StackProps {
  apiUrl: string;
  sharedEnv: string;
  stage: string;
  resourcePrefix: string;
}

export class WebStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WebStackProps) {
    super(scope, id, props);

    const sharedConfig: SharedLookupValues = new SharedLookupConstruct(this, "SharedLookup", {
      sharedEnv: props.sharedEnv,
    });

    cdk.Tags.of(this).add("SharedContractVersion", sharedConfig.contractVersion);
    cdk.Tags.of(this).add("SharedEnv", sharedConfig.sharedEnv);

    const web = new WebConstruct(this, "Web", {
      resourcePrefix: props.resourcePrefix,
      apiUrl: props.apiUrl,
    });

    new cdk.CfnOutput(this, "WebUrl", {
      value: `https://${web.distributionDomain}`,
      description: "CloudFront distribution URL",
    });
  }
}
