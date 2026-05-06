import { Construct } from "constructs";
import { publishSharedSesParameters } from "./parameters";
import { readSesInputValues } from "./read-input";
import { createSesIdentity } from "./ses-identity";

export interface SharedSesConstructProps {
  sharedEnv: string;
}

/*
 * # shared SES 設定 Construct
 *
 * ## 目的
 * CD 入力値（HOSTED_ZONE_ID / HOSTED_ZONE_NAME）から SES 送信ドメイン/送信元を生成し、identity 作成と shared 値公開を compose する。
 */
export class SharedSesConstruct extends Construct {
  public readonly fromEmail: string;
  public readonly fromEmailArn: string;

  constructor(scope: Construct, id: string, props: SharedSesConstructProps) {
    super(scope, id);

    const sesInputValues = readSesInputValues(this, {
      sharedEnv: props.sharedEnv,
    });
    this.fromEmail = sesInputValues.fromEmail;

    const sesIdentity = createSesIdentity(this, "Identity", {
      baseDomain: sesInputValues.baseDomain,
      hostedZoneId: sesInputValues.hostedZoneId,
      identityDomain: sesInputValues.identityDomain,
    });
    this.fromEmailArn = sesIdentity.emailIdentityArn;

    publishSharedSesParameters(this, "SharedSes", {
      sharedEnv: props.sharedEnv,
      fromEmail: this.fromEmail,
      fromEmailArn: this.fromEmailArn,
    });
  }
}
