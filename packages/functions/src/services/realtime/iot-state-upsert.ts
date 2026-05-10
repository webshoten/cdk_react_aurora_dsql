import { createIotStateRepository } from "@pf/core";
import { isPatientStatePayload, isRoomStatePayload } from "@pf/mqtt-schema";
import { requireEnv } from "../../shared/env.ts";

/*
 * # IoT State Upsert
 *
 * ## 目的
 * TopicRule 受信 payload を room / patient state として DynamoDB に upsert 保存する。
 */
export async function upsertIotStateFromEvent(value: unknown): Promise<void> {
  if (typeof value !== "object" || value === null) {
    throw new Error("payload must be object");
  }
  const payload = value as Record<string, unknown>;
  const topic = typeof payload.receivedTopic === "string" ? payload.receivedTopic : "";
  if (!topic) {
    throw new Error("receivedTopic is required");
  }

  const repository = createIotStateRepository({
    region: requireEnv("AWS_REGION"),
    tableName: requireEnv("IOT_STATE_TABLE_NAME"),
  });
  const updatedAt = new Date().toISOString();

  if (isRoomStatePayload(payload)) {
    await repository.upsertRoomState({
      topic,
      roomId: payload.roomId,
      medicalInstitutionId: payload.medicalInstitutionId,
      event: payload.event,
      roomState: payload.roomState,
      updatedAt,
    });
    return;
  }

  if (isPatientStatePayload(payload)) {
    await repository.upsertPatientState({
      topic,
      roomId: payload.roomId,
      medicalInstitutionId: payload.medicalInstitutionId,
      patientId: payload.patientId,
      event: payload.event,
      patientState: payload.patientState,
      updatedAt,
    });
    return;
  }

  throw new Error("payload schema is invalid");
}
