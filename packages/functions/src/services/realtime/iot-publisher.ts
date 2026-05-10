import { IoTDataPlaneClient, PublishCommand } from "@aws-sdk/client-iot-data-plane";
import {
  buildIotEventTopic,
  normalizeMedicalInstitutionId,
  type RoomStatePayload,
} from "@pf/mqtt-schema";
import { requireEnv } from "../../shared/env.ts";

export type PublishOnStartRoomInput = {
  medicalInstitutionId: string;
  roomId: string;
  startedAt: string;
};

/*
 * # onStartRoom Publish
 *
 * ## 目的
 * GraphQL mutation から呼ばれ、room 開始イベントを IoT Data Plane へ publish する。
 */
export async function publishOnStartRoom(
  input: PublishOnStartRoomInput,
): Promise<{ topic: string }> {
  const topic = buildIotEventTopic({
    sharedEnv: requireEnv("SHARED_ENV"),
    stage: requireEnv("STAGE"),
    medicalInstitutionId: normalizeMedicalInstitutionId(input.medicalInstitutionId),
    roomId: input.roomId,
  });

  const payload: RoomStatePayload = {
    event: "onStartRoom",
    roomId: input.roomId,
    medicalInstitutionId: normalizeMedicalInstitutionId(input.medicalInstitutionId),
    roomState: {
      startedAt: input.startedAt,
    },
  };

  const endpoint = requireEnv("IOT_DATA_ENDPOINT");
  const region = requireEnv("AWS_REGION");
  const client = new IoTDataPlaneClient({
    endpoint: `https://${endpoint}`,
    region,
  });

  await client.send(
    new PublishCommand({
      topic,
      qos: 0,
      payload: new TextEncoder().encode(JSON.stringify(payload)),
    }),
  );

  return { topic };
}
