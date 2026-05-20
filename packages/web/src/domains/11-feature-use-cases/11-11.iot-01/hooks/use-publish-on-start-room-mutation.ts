import { useTypedMutation } from "@pf/graphql-schema/urql";

/*
 * # onStartRoom publish Mutation フック
 *
 * ## 目的
 * 11-11 画面から backend publish（GraphQL mutation）を実行する。
 */
export function usePublishOnStartRoomMutation() {
  return useTypedMutation((variables: { roomId: string; startedAt: string }) => ({
    publishOnStartRoom: {
      __args: {
        roomId: variables.roomId,
        startedAt: variables.startedAt,
      },
      published: true,
      topic: true,
    },
  }));
}
