export type IotEventTopicParts = {
  sharedEnv: string;
  stage: string;
  medicalInstitutionId: string;
  roomId: string;
};

/*
 * # 医療機関 ID 検証
 *
 * ## 目的
 * IoT topic と payload の共通前提である `medicalInstitutionId` を数値文字列に限定する。
 */
export function isValidMedicalInstitutionId(value: string): boolean {
  return /^[0-9]+$/.test(value.trim());
}

/*
 * # 医療機関 ID 正規化
 *
 * ## 目的
 * topic 構築時に空値・形式不正を早期に検出し、呼び出し側の実装ぶれを防ぐ。
 */
export function normalizeMedicalInstitutionId(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("medicalInstitutionId is required");
  }
  if (!isValidMedicalInstitutionId(trimmed)) {
    throw new Error("medicalInstitutionId must be numeric string");
  }
  return trimmed;
}

/*
 * # Event Topic 構築
 *
 * ## 目的
 * Web / backend / CDK で同じ MQTT event topic 文字列を使えるようにする。
 */
export function buildIotEventTopic(input: IotEventTopicParts): string {
  const sharedEnv = input.sharedEnv.trim();
  const stage = input.stage.trim();
  const roomId = input.roomId.trim();
  const medicalInstitutionId = normalizeMedicalInstitutionId(input.medicalInstitutionId);

  if (!sharedEnv) {
    throw new Error("sharedEnv is required");
  }
  if (!stage) {
    throw new Error("stage is required");
  }
  if (!roomId) {
    throw new Error("roomId is required");
  }

  return `pf/${sharedEnv}/${stage}/medicalInstitution/${medicalInstitutionId}/room/${roomId}/event`;
}

/*
 * # TopicRule SQL 構築
 *
 * ## 目的
 * event topic を受信する IoT TopicRule の SQL を同じ規則で構築する。
 */
export function buildIotEventTopicRuleSql(input: { sharedEnv: string; stage: string }): string {
  const sharedEnv = input.sharedEnv.trim();
  const stage = input.stage.trim();

  if (!sharedEnv) {
    throw new Error("sharedEnv is required");
  }
  if (!stage) {
    throw new Error("stage is required");
  }

  const topic = `pf/${sharedEnv}/${stage}/medicalInstitution/+/room/+/event`;
  return `SELECT * FROM '${topic}'`;
}
