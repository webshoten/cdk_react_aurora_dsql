import type { AppSchemaBuilder } from "@functions/domains/graphql/schema/types.ts";
import { realtimeResolver } from "@functions/domains/realtime/resolver.ts";

export function registerRealtimeSchema(builder: AppSchemaBuilder): void {
  const PublishOnStartRoomPayloadRef = builder.objectRef<{ published: boolean; topic: string }>(
    "PublishOnStartRoomPayload",
  );
  const IotStateRef = builder.objectRef<{
    entityType: string;
    event: string;
    medicalInstitutionId: string;
    patientStateJson: string | null;
    roomId: string;
    roomStateJson: string | null;
    sessionUid: string;
    topic: string;
    updatedAt: string;
  }>("IotState");

  PublishOnStartRoomPayloadRef.implement({
    fields: (t) => ({
      published: t.exposeBoolean("published", { description: "publish 実行成功フラグ。" }),
      topic: t.exposeString("topic", { description: "publish 先 topic。" }),
    }),
  });

  IotStateRef.implement({
    fields: (t) => ({
      topic: t.exposeString("topic", { description: "MQTT topic。" }),
      sessionUid: t.exposeString("sessionUid", { description: "session UID（roomId）。" }),
      entityType: t.exposeString("entityType", { description: "state entity 種別。" }),
      medicalInstitutionId: t.exposeString("medicalInstitutionId", { description: "医療機関 ID。" }),
      roomId: t.exposeString("roomId", { description: "監視ルーム ID。" }),
      event: t.exposeString("event", { description: "最新反映イベント名。" }),
      roomStateJson: t.exposeString("roomStateJson", {
        description: "room state JSON 文字列。未設定時は null。",
        nullable: true,
      }),
      patientStateJson: t.exposeString("patientStateJson", {
        description: "patient state JSON 文字列。未設定時は null。",
        nullable: true,
      }),
      updatedAt: t.exposeString("updatedAt", { description: "最終更新日時（ISO8601）。" }),
    }),
  });

  builder.queryField("iotStatesByRoom", (t) =>
    t.field({
      description: "指定 roomId に対応する IoT state 一覧を返す。",
      type: [IotStateRef],
      args: {
        roomId: t.arg.string({ required: true }),
      },
      resolve: async (_root, args, context) => realtimeResolver.iotStatesByRoom(context, args),
    }),
  );

  builder.mutationField("publishOnStartRoom", (t) =>
    t.field({
      description: "room 開始イベントを backend 経由で MQTT publish する。",
      type: PublishOnStartRoomPayloadRef,
      args: {
        roomId: t.arg.string({ required: true }),
        startedAt: t.arg.string({ required: true }),
      },
      resolve: async (_root, args, context) =>
        realtimeResolver.publishOnStartRoom(context, {
          roomId: args.roomId,
          startedAt: args.startedAt,
        }),
    }),
  );
}
