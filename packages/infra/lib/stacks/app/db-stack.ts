import type { SharedLookupValues } from "@infra/lib/constructs/shared/lookup";
import { SharedLookupConstruct } from "@infra/lib/constructs/shared/lookup";
import * as dsql from "aws-cdk-lib/aws-dsql";
import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";

export interface DbStackProps extends cdk.StackProps {
  sharedEnv: string;
  stage: string;
  resourcePrefix: string;
}

export class DbStack extends cdk.Stack {
  public readonly clusterArn: string;
  public readonly endpoint: string;
  public readonly identifier: string;

  constructor(scope: Construct, id: string, props: DbStackProps) {
    super(scope, id, props);

    const sharedConfig: SharedLookupValues = new SharedLookupConstruct(this, "SharedLookup", {
      sharedEnv: props.sharedEnv,
    });

    cdk.Tags.of(this).add("SharedContractVersion", sharedConfig.contractVersion);
    cdk.Tags.of(this).add("SharedEnv", sharedConfig.sharedEnv);

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

    new cdk.CfnOutput(this, "DsqlClusterArn", {
      value: this.clusterArn,
      description: "Aurora DSQL cluster ARN",
    });

    new cdk.CfnOutput(this, "DsqlEndpoint", {
      value: this.endpoint,
      description: "Aurora DSQL endpoint",
    });

    new cdk.CfnOutput(this, "DsqlClusterIdentifier", {
      value: this.identifier,
      description: "Aurora DSQL cluster identifier",
    });
  }
}
