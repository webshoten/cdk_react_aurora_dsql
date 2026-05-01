import type { CustomMessageTriggerEvent } from "aws-lambda";

/*
 * # customMessage Trigger ハンドラ
 *
 * ## 目的
 * Cognito 通知メッセージ制御ポイントの入口を提供する。
 *
 * ## 説明
 * 現段階は接続確認と監査ログ出力のみを行い、イベントをそのまま返す。
 */
export async function handler(event: CustomMessageTriggerEvent): Promise<CustomMessageTriggerEvent> {
  console.info(
    JSON.stringify({
      clientId: event.callerContext.clientId,
      result: "pass",
      trigger: "customMessage",
      triggerSource: event.triggerSource,
      userName: event.userName,
    }),
  );

  return event;
}
