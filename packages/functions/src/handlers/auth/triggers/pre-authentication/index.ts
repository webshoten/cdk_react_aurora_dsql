import type { PreAuthenticationTriggerEvent } from "aws-lambda";

/*
 * # preAuthentication Trigger ハンドラ
 *
 * ## 目的
 * サインイン確定前の検証ポイントを受ける入口を提供する。
 *
 * ## 説明
 * 現段階は接続確認と監査ログ出力のみを行い、イベントをそのまま返す。
 */
export async function handler(event: PreAuthenticationTriggerEvent): Promise<PreAuthenticationTriggerEvent> {
  // 11-3 仕様では、ここで SSM の clientId->clientName マップを参照してログイン許可/拒否を判定する想定。
  // 現段階は trigger 接続確認のため、イベントをそのまま通す。
  console.info(
    JSON.stringify({
      clientId: event.callerContext.clientId,
      result: "pass",
      trigger: "preAuthentication",
      triggerSource: event.triggerSource,
      userName: event.userName,
    }),
  );

  return event;
}
