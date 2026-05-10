import {
  isPatientStatePayload,
  isRoomStatePayload,
  isValidMedicalInstitutionId,
} from "@pf/mqtt-schema";

type TopicParts = {
  medicalInstitutionId: string;
  roomId: string;
  sharedEnv: string;
  stage: string;
};

export type IotEventValidationResult =
  | {
      ok: true;
      eventType: "patient" | "room";
      topic: string;
      topicParts: TopicParts;
    }
  | {
      ok: false;
      reason: string;
    };

/*
 * # IoT Event 入力検証
 *
 * ## 目的
 * TopicRule 受信 payload と topic segment の整合を検証し、保存前に不正入力を弾く。
 */
export function validateIotEventInput(value: unknown): IotEventValidationResult {
  const payload = asRecord(value);
  if (!payload) {
    return { ok: false, reason: "payload must be object" };
  }

  const topic = typeof payload.receivedTopic === "string" ? payload.receivedTopic.trim() : "";
  if (!topic) {
    return { ok: false, reason: "receivedTopic is required" };
  }

  const topicParts = parseEventTopic(topic);
  if (!topicParts) {
    return { ok: false, reason: "receivedTopic format is invalid" };
  }

  if (!isValidMedicalInstitutionId(topicParts.medicalInstitutionId)) {
    return { ok: false, reason: "topic medicalInstitutionId must be numeric string" };
  }

  if (isRoomStatePayload(payload)) {
    if (payload.medicalInstitutionId !== topicParts.medicalInstitutionId) {
      return { ok: false, reason: "room payload medicalInstitutionId mismatches topic" };
    }
    if (payload.roomId !== topicParts.roomId) {
      return { ok: false, reason: "room payload roomId mismatches topic" };
    }
    return { ok: true, eventType: "room", topic, topicParts };
  }

  if (isPatientStatePayload(payload)) {
    if (payload.medicalInstitutionId !== topicParts.medicalInstitutionId) {
      return { ok: false, reason: "patient payload medicalInstitutionId mismatches topic" };
    }
    if (payload.roomId !== topicParts.roomId) {
      return { ok: false, reason: "patient payload roomId mismatches topic" };
    }
    return { ok: true, eventType: "patient", topic, topicParts };
  }

  return { ok: false, reason: "payload schema is invalid" };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  return value as Record<string, unknown>;
}

function parseEventTopic(topic: string): TopicParts | null {
  const matched = topic.match(
    /^pf\/([^/]+)\/([^/]+)\/medicalInstitution\/([^/]+)\/room\/([^/]+)\/event$/,
  );
  if (!matched) {
    return null;
  }
  const [, sharedEnv, stage, medicalInstitutionId, roomId] = matched;
  if (!sharedEnv || !stage || !medicalInstitutionId || !roomId) {
    return null;
  }

  return {
    sharedEnv,
    stage,
    medicalInstitutionId,
    roomId,
  };
}
