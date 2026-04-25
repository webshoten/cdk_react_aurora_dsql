import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

export interface SharedLookupConstructProps {
  sharedEnv: string;
}

export interface SharedLookupValues {
  contractVersion: string;
  sharedEnv: string;
}

export class SharedLookupConstruct extends Construct implements SharedLookupValues {
  public readonly contractVersion: string;
  public readonly sharedEnv: string;

  constructor(scope: Construct, id: string, props: SharedLookupConstructProps) {
    super(scope, id);

    const prefix = `/pf/shared/${props.sharedEnv}/meta`;

    this.sharedEnv = ssm.StringParameter.valueForStringParameter(this, `${prefix}/sharedEnv`);
    this.contractVersion = ssm.StringParameter.valueForStringParameter(
      this,
      `${prefix}/contractVersion`,
    );
  }
}
