import type { GraphqlContext } from "@functions/shared/context/graphql-context.ts";
import { realtimeService, type IotStateView } from "@functions/domains/realtime/service.ts";

/*
 * # Realtime Resolver
 *
 * ## 目的
 * GraphQL 入出力と Realtime サービスを接続する。
 */
export const realtimeResolver = {
  publishOnStartRoom(
    context: GraphqlContext,
    args: { roomId: string; startedAt: string },
  ): Promise<{ published: boolean; topic: string }> {
    return realtimeService.publishRoomStarted(context, args);
  },

  iotStatesByRoom(context: GraphqlContext, args: { roomId: string }): Promise<IotStateView[]> {
    return realtimeService.listIotStatesByRoom(context, args);
  },
};
