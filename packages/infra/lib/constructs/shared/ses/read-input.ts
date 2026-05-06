import { resolveHostedZoneInput } from "@infra/lib/constructs/shared/hosted-zone/hosted-zone";
import type { Construct } from "constructs";

export interface ReadSesInputValuesInput {
  sharedEnv: string;
}

export interface SesInputValues {
  baseDomain: string;
  fromEmail: string;
  hostedZoneId: string;
  identityDomain: string;
}

/*
 * # SES 入力値解決
 *
 * ## 目的
 * CD 入力（HOSTED_ZONE_ID / HOSTED_ZONE_NAME）から SES 送信ドメイン/送信元アドレスを規則生成する。
 */
export function readSesInputValues(
  scope: Construct,
  input: ReadSesInputValuesInput,
): SesInputValues {
  const hostedZoneInput = resolveHostedZoneInput(scope, {
    sharedEnv: input.sharedEnv,
  });
  const baseDomain = hostedZoneInput.zoneName;
  const identityDomain = `${input.sharedEnv}.${baseDomain}`;

  return {
    baseDomain,
    hostedZoneId: hostedZoneInput.hostedZoneId,
    identityDomain,
    fromEmail: `no-reply@${identityDomain}`,
  };
}
