import * as ses from "aws-cdk-lib/aws-ses";
import * as ssm from "aws-cdk-lib/aws-ssm";
import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";

export interface SharedSesConstructProps {
  sharedEnv: string;
}

/*
 * # shared SES 設定 Construct
 *
 * ## 目的
 * CD 入力値を参照して SES identity を作成し、app stack 向けの shared/ses 値を公開する。
 */
export class SharedSesConstruct extends Construct {
  public readonly fromEmail: string;
  public readonly fromEmailArn: string;

  constructor(scope: Construct, id: string, props: SharedSesConstructProps) {
    super(scope, id);

    const cdEnvPrefix = `/pf/cd/${props.sharedEnv}/env`;
    const sharedSesPrefix = `/pf/shared/${props.sharedEnv}/ses`;

    this.fromEmail = ssm.StringParameter.valueForStringParameter(this, `${cdEnvPrefix}/SES_FROM_EMAIL`);

    const fromEmailIdentity = new ses.EmailIdentity(this, "FromEmailIdentity", {
      identity: ses.Identity.email(this.fromEmail),
    });
    this.fromEmailArn = fromEmailIdentity.emailIdentityArn;

    const fromEmailParam = new ssm.StringParameter(this, "FromEmailParameter", {
      parameterName: `${sharedSesPrefix}/fromEmail`,
      stringValue: this.fromEmail,
    });
    fromEmailParam.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);

    const fromEmailArnParam = new ssm.StringParameter(this, "FromEmailArnParameter", {
      parameterName: `${sharedSesPrefix}/fromEmailArn`,
      stringValue: this.fromEmailArn,
    });
    fromEmailArnParam.applyRemovalPolicy(cdk.RemovalPolicy.DESTROY);
  }
}
