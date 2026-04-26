import * as dsql from "aws-cdk-lib/aws-dsql";
import { Construct } from "constructs";

export interface DbConstructProps {
  resourcePrefix: string;
  stage: string;
}

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
