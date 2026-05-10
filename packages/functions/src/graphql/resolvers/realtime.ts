import { createIotStateRepository } from "@pf/core";
import { buildIotEventTopic } from "@pf/mqtt-schema";
import { publishOnStartRoom } from "../../services/realtime/iot-publisher.ts";
import { requireEnv } from "../../shared/env.ts";
import type { GraphqlContext } from "../context.ts";

/*
 * ## 目的
 * room 開始イベントを backend から IoT publish する。
 *
 * ## 説明
 * 認証 context の所属 IDを必須とし、payload の medicalInstitutionId と topic 範囲を一致させる。
 */
export async function resolvePublishOnStartRoom(
  context: GraphqlContext,
  args: { roomId: string; startedAt: string },
): Promise<{ published: boolean; topic: string }> {
  if (!context.auth?.institutionCode) {
    throw new Error("institutionCode is required in auth context");
  }

  const result = await publishOnStartRoom({
    medicalInstitutionId: context.auth.institutionCode,
    roomId: args.roomId,
    startedAt: args.startedAt,
  });

  return {
    published: true,
    topic: result.topic,
  };
}

/*
 * ## 目的
 * 指定 roomId の IoT state（room / patient）を DynamoDB から取得する。
 */
export async function resolveIotStatesByRoom(
  context: GraphqlContext,
  args: { roomId: string },
): Promise<
  Array<{
    entityType: string;
    event: string;
    medicalInstitutionId: string;
    patientStateJson: string | null;
    roomId: string;
    roomStateJson: string | null;
    sessionUid: string;
    topic: string;
    updatedAt: string;
  }>
> {
  if (!context.auth?.institutionCode) {
    throw new Error("institutionCode is required in auth context");
  }
  const roomId = args.roomId.trim();
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
}
