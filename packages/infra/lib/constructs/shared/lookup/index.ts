import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

export interface SharedLookupConstructProps {
  sharedEnv: string;
}

export interface SharedLookupValues {
  contractVersion: string;
  sharedEnv: string;
  sesFromEmail: string;
  sesFromEmailArn: string;
  baseDomain: string;
  hostedZoneId: string;
}

/*
 * # 共有層メタ情報の SSM 参照
 *
 * ## 目的
 * 各 App Stack（Db / Api / Ops / Web）が共有層（SharedStack）に保存された設定値を SSM 経由で読み出す共通入口。
 *
 * ## 説明
 * - `/pf/shared/<sharedEnv>/meta/*` を参照。今は sharedEnv と contractVersion の 2 値。
 * - valueForStringParameter を利用 → CloudFormation 動的参照（{{resolve:ssm:...}}）として展開され、deploy 時に値解決される（synth 時には固定文字列に解決しない）。
 * - 各 Stack が同名で SharedLookup を生やすことを許容（Construct ID が Stack scope で衝突しないため）。
 *
 * ## NOTE
 * - SSM パラメータが未配置の sharedEnv に対して deploy すると CFN 側で失敗する。SharedStack を先に deploy しておく前提。
 */
export class SharedLookupConstruct extends Construct implements SharedLookupValues {
  public readonly contractVersion: string;
  public readonly sharedEnv: string;
  public readonly sesFromEmail: string;
  public readonly sesFromEmailArn: string;
  public readonly baseDomain: string;
  public readonly hostedZoneId: string;

  constructor(scope: Construct, id: string, props: SharedLookupConstructProps) {
    super(scope, id);

    const prefix = `/pf/shared/${props.sharedEnv}/meta`;
    const sesPrefix = `/pf/shared/${props.sharedEnv}/ses`;
    const domainPrefix = `/pf/shared/${props.sharedEnv}/domain`;

    this.sharedEnv = ssm.StringParameter.valueForStringParameter(this, `${prefix}/sharedEnv`);
    this.contractVersion = ssm.StringParameter.valueForStringParameter(
      this,
      `${prefix}/contractVersion`,
    );
    this.sesFromEmail = ssm.StringParameter.valueForStringParameter(this, `${sesPrefix}/fromEmail`);
    this.sesFromEmailArn = ssm.StringParameter.valueForStringParameter(
      this,
      `${sesPrefix}/fromEmailArn`,
    );
    this.baseDomain = ssm.StringParameter.valueForStringParameter(
      this,
      `${domainPrefix}/baseDomain`,
    );
    this.hostedZoneId = ssm.StringParameter.valueForStringParameter(
      this,
      `${domainPrefix}/hostedZoneId`,
    );
  }
}
