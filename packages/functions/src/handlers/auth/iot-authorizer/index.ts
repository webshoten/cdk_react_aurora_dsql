import {
  authorizeIotConnection,
  type IotCustomAuthorizerEvent,
} from "../../../services/auth/iot-authorizer.ts";

/*
 * # IoT Custom Authorizer ハンドラ
 *
 * ## 目的
 * AWS IoT Core からの認可要求を受け、許可ポリシーまたは拒否レスポンスを返す。
 */
export async function handler(event: IotCustomAuthorizerEvent) {
  try {
    return await authorizeIotConnection(event);
  } catch {
    return {
      isAuthenticated: false,
      principalId: "unauthorized",
      disconnectAfterInSeconds: 300,
      refreshAfterInSeconds: 300,
      policyDocuments: [],
    };
  }
}
