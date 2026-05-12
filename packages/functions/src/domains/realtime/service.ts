import { createIotStateRepository } from "@pf/core";
import { buildIotEventTopic } from "@pf/mqtt-schema";
import type { GraphqlContext } from "@functions/shared/context/graphql-context.ts";
import { publishOnStartRoom } from "@functions/domains/realtime/iot-publisher.ts";
import { requireEnv } from "@functions/shared/env.ts";

export type IotStateView = {
  entityType: string;
  event: string;
  medicalInstitutionId: string;
  patientStateJson: string | null;
  roomId: string;
  roomStateJson: string | null;
  sessionUid: string;
  topic: string;
  updatedAt: string;
};

/*
 * # Realtime ユースケースサービス
 *
 * ## 目的
 * Realtime ドメインの業務処理（publish / state 取得）を集約する。
 */
export const realtimeService = {
  async publishRoomStarted(
    context: GraphqlContext,
    input: { roomId: string; startedAt: string },
  ): Promise<{ published: boolean; topic: string }> {
    if (!context.auth?.institutionCode) {
      throw new Error("institutionCode is required in auth context");
    }

    const result = await publishOnStartRoom({
      medicalInstitutionId: context.auth.institutionCode,
      roomId: input.roomId,
      startedAt: input.startedAt,
    });

    return {
      published: true,
      topic: result.topic,
    };
  },

  async listIotStatesByRoom(
    context: GraphqlContext,
    input: { roomId: string },
  ): Promise<IotStateView[]> {
    if (!context.auth?.institutionCode) {
      throw new Error("institutionCode is required in auth context");
    }
    const roomId = input.roomId.trim();
    if (!roomId) {
      throw new Error("roomId is required");
    }

    const topic = buildIotEventTopic({
      sharedEnv: requireEnv("SHARED_ENV"),
      stage: requireEnv("STAGE"),
      medicalInstitutionId: context.auth.institutionCode,
      roomId,
    });

    const repository = createIotStateRepository({
      region: requireEnv("AWS_REGION"),
      tableName: requireEnv("IOT_STATE_TABLE_NAME"),
    });
    const rows = await repository.listByRoom({ topic, roomId });

    return rows.map((row) => ({
      topic: row.topic,
      sessionUid: row.sessionUid,
      entityType: row.entityType,
      medicalInstitutionId: row.medicalInstitutionId,
      roomId: row.roomId,
      event: row.event,
      roomStateJson: row.roomState ? JSON.stringify(row.roomState) : null,
      patientStateJson: row.patientState ? JSON.stringify(row.patientState) : null,
      updatedAt: row.updatedAt,
    }));
  },
};
