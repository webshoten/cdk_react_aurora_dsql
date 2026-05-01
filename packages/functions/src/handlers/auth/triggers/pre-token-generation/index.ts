import type { PreTokenGenerationTriggerEvent } from "aws-lambda";

/*
 * # preTokenGeneration Trigger ハンドラ
 *
 * ## 目的
 * トークン発行直前の加工ポイントを受ける入口を提供する。
 *
 * ## 説明
 * 現段階は接続確認と監査ログ出力のみを行い、イベントをそのまま返す。
 */
export async function handler(event: PreTokenGenerationTriggerEvent): Promise<PreTokenGenerationTriggerEvent> {
  console.info(
    JSON.stringify({
      clientId: event.callerContext.clientId,
      result: "pass",
      trigger: "preTokenGeneration",
      triggerSource: event.triggerSource,
      userName: event.userName,
    }),
  );

  return event;
}
