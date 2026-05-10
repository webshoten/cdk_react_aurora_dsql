import { useTypedQuery } from "@pf/graphql-schema/urql";

/*
 * # IoT state 一覧 Query フック
 *
 * ## 目的
 * 指定 roomId の保存済み IoT state（room / patient）を GraphQL から取得する。
 *
 * ## 説明
 * roomId 未指定時は query を実行しない（pause=true）ことで、Task 8 の前提を hook 側で固定する。
 */
export function useIotStatesByRoomQuery(roomId: string, pause: boolean) {
  const trimmedRoomId = roomId.trim();
  const shouldPause = pause || trimmedRoomId.length === 0;

  return useTypedQuery({
    query: {
      iotStatesByRoom: {
        __args: { roomId: trimmedRoomId },
        topic: true,
        sessionUid: true,
        entityType: true,
        medicalInstitutionId: true,
        roomId: true,
        event: true,
        roomStateJson: true,
        patientStateJson: true,
        updatedAt: true,
      },
    },
    pause: shouldPause,
  });
}
