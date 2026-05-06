import type * as acm from "aws-cdk-lib/aws-certificatemanager";
import { Construct } from "constructs";
import { createWebCertificate } from "./web-certificate";

export interface WebCertificateConstructProps {
  baseDomain: string;
  hostedZoneId: string;
  stage: string;
}

/*
 * # Web 証明書 Construct
 *
 * ## 目的
 * `web.<stage>.<baseDomain>` の証明書作成を compose する。
 */
export class WebCertificateConstruct extends Construct {
  public readonly certificate: acm.Certificate;
  public readonly webDomainName: string;

  constructor(scope: Construct, id: string, props: WebCertificateConstructProps) {
    super(scope, id);

    this.webDomainName = `web.${props.stage}.${props.baseDomain}`;
    this.certificate = createWebCertificate(this, "Certificate", {
      baseDomain: props.baseDomain,
      domainName: this.webDomainName,
      hostedZoneId: props.hostedZoneId,
    });
  }
}
