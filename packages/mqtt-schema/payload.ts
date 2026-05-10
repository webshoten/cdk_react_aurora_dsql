export type RoomStatePayload = {
  event: string;
  medicalInstitutionId: string;
  roomId: string;
  roomState: {
    startedAt?: string;
    [key: string]: unknown;
  };
};

export type PatientStatePayload = {
  event: string;
  medicalInstitutionId: string;
  patientId: string;
  patientState: {
    handRaiseAt?: string;
    [key: string]: unknown;
  };
  roomId: string;
};

export type IotEventPayload = RoomStatePayload | PatientStatePayload;

/*
 * # Room State 判定
 *
 * ## 目的
 * 受信 payload が room state 形式かを判定し、処理分岐を単純化する。
 */
export function isRoomStatePayload(value: unknown): value is RoomStatePayload {
  if (!isObject(value)) {
    return false;
  }
  return (
    typeof value.event === "string" &&
    typeof value.medicalInstitutionId === "string" &&
    typeof value.roomId === "string" &&
    isObject(value.roomState)
  );
}

/*
 * # Patient State 判定
 *
 * ## 目的
 * 受信 payload が patient state 形式かを判定し、処理分岐を単純化する。
 */
export function isPatientStatePayload(value: unknown): value is PatientStatePayload {
  if (!isObject(value)) {
    return false;
  }
  return (
    typeof value.event === "string" &&
    typeof value.medicalInstitutionId === "string" &&
    typeof value.roomId === "string" &&
    typeof value.patientId === "string" &&
    isObject(value.patientState)
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
