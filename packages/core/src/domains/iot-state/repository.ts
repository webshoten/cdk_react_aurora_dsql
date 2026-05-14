import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Entity } from "electrodb";

export type UpsertIotRoomStateInput = {
  event: string;
  medicalInstitutionId: string;
  roomId: string;
  roomState: Record<string, unknown>;
  topic: string;
  updatedAt: string;
};

export type UpsertIotPatientStateInput = {
  event: string;
  medicalInstitutionId: string;
  patientId: string;
  patientState: Record<string, unknown>;
  roomId: string;
  topic: string;
  updatedAt: string;
};

type CreateIotStateRepositoryInput = {
  region: string;
  tableName: string;
};

export type IotStateRecord = {
  entityType: string;
  event: string;
  medicalInstitutionId: string;
  patientState?: Record<string, unknown>;
  roomId: string;
  roomState?: Record<string, unknown>;
  sessionUid: string;
  topic: string;
  updatedAt: string;
};

const model = {
  service: "pf",
  entity: "iotState",
  version: "1",
};

/*
 * # IoT State Repository
 *
 * ## 目的
 * IoT event から room / patient state を DynamoDB へ upsert する永続化入口を提供する。
 */
export function createIotStateRepository(input: CreateIotStateRepositoryInput) {
  const client = DynamoDBDocumentClient.from(new DynamoDBClient({ region: input.region }));

  const iotStateEntity = new Entity(
    {
      model,
      attributes: {
        topic: { type: "string", required: true },
        sessionUid: { type: "string", required: true },
        entityType: { type: "string", required: true },
        medicalInstitutionId: { type: "string", required: true },
        roomId: { type: "string", required: true },
        event: { type: "string", required: true },
        roomState: { type: "any" },
        patientState: { type: "any" },
        updatedAt: { type: "string", required: true },
      },
      indexes: {
        primary: {
          pk: { field: "pk", composite: ["topic"] },
          sk: { field: "sk", composite: ["sessionUid", "entityType"] },
        },
      },
    },
    {
      table: input.tableName,
      client,
    },
  );

  return {
    async upsertRoomState(params: UpsertIotRoomStateInput): Promise<void> {
      await iotStateEntity
        .upsert({
          topic: params.topic,
          sessionUid: params.roomId,
          entityType: "room",
          medicalInstitutionId: params.medicalInstitutionId,
          roomId: params.roomId,
          event: params.event,
          roomState: params.roomState,
          updatedAt: params.updatedAt,
        })
        .go();
    },
    async upsertPatientState(params: UpsertIotPatientStateInput): Promise<void> {
      await iotStateEntity
        .upsert({
          topic: params.topic,
          sessionUid: params.roomId,
          entityType: `patient_${params.patientId}`,
          medicalInstitutionId: params.medicalInstitutionId,
          roomId: params.roomId,
          event: params.event,
          patientState: params.patientState,
          updatedAt: params.updatedAt,
        })
        .go();
    },
    async listByRoom(input: { roomId: string; topic: string }): Promise<IotStateRecord[]> {
      const result = await iotStateEntity.query
        .primary({
          topic: input.topic,
          sessionUid: input.roomId,
        })
        .go();

      return result.data.map((item) => ({
        topic: item.topic,
        sessionUid: item.sessionUid,
        entityType: item.entityType,
        medicalInstitutionId: item.medicalInstitutionId,
        roomId: item.roomId,
        event: item.event,
        roomState: item.roomState as Record<string, unknown> | undefined,
        patientState: item.patientState as Record<string, unknown> | undefined,
        updatedAt: item.updatedAt,
      }));
    },
  };
}
