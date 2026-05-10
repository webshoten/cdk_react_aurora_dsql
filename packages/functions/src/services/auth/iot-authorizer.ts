import { CognitoJwtVerifier } from "aws-jwt-verify";
import { requireEnv } from "../../shared/env.ts";

export type IotCustomAuthorizerEvent = {
  protocolData?: {
    mqtt?: {
      clientId?: string;
      username?: string;
    };
  };
  token?: string;
};

export type IotCustomAuthorizerResponse = {
  disconnectAfterInSeconds: number;
  isAuthenticated: boolean;
  policyDocuments: Array<{
    Statement: Array<{
      Action: string | string[];
      Effect: "Allow" | "Deny";
      Resource: string | string[];
    }>;
    Version: "2012-10-17";
  }>;
  principalId: string;
  refreshAfterInSeconds: number;
};

const verifier = CognitoJwtVerifier.create({
  userPoolId: requireEnv("USER_POOL_ID"),
  tokenUse: "id",
  clientId: requireEnv("USER_POOL_CLIENT_ID"),
});

/*
 * # IoT Custom Authorizer
 *
 * ## 目的
 * Cognito ID token の検証結果に基づき、医療機関単位の MQTT subscribe 権限を返す。
 */
export async function authorizeIotConnection(
  event: IotCustomAuthorizerEvent,
): Promise<IotCustomAuthorizerResponse> {
  const token = resolveToken(event);
  const payload = await verifier.verify(token);
  const institutionId = readInstitutionId(payload["custom:institution_id"]);
  const principalId = sanitizePrincipalId(payload.sub);
  const clientId = sanitizeClientId(event.protocolData?.mqtt?.clientId);

  const region = requireEnv("AWS_REGION");
  const accountId = requireEnv("AWS_ACCOUNT_ID");
  const sharedEnv = requireEnv("IOT_SHARED_ENV");
  const stage = requireEnv("IOT_STAGE");

  const subscribeTopicFilter = `pf/${sharedEnv}/${stage}/medicalInstitution/${institutionId}/room/*/event`;
  const receiveTopic = `pf/${sharedEnv}/${stage}/medicalInstitution/${institutionId}/room/*/event`;

  return {
    isAuthenticated: true,
    principalId,
    disconnectAfterInSeconds: 86400,
    refreshAfterInSeconds: 300,
    policyDocuments: [
      {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: "iot:Connect",
            Resource: `arn:aws:iot:${region}:${accountId}:client/${clientId}`,
          },
          {
            Effect: "Allow",
            Action: "iot:Subscribe",
            Resource: `arn:aws:iot:${region}:${accountId}:topicfilter/${subscribeTopicFilter}`,
          },
          {
            Effect: "Allow",
            Action: "iot:Receive",
            Resource: `arn:aws:iot:${region}:${accountId}:topic/${receiveTopic}`,
          },
        ],
      },
    ],
  };
}

function resolveToken(event: IotCustomAuthorizerEvent): string {
  const fromTokenField = event.token?.trim();
  if (fromTokenField) {
    return fromTokenField;
  }

  const username = event.protocolData?.mqtt?.username?.trim();
  if (!username) {
    throw new Error("token is required");
  }

  const queryIndex = username.indexOf("?");
  if (queryIndex < 0) {
    throw new Error("token is required");
  }

  const query = username.slice(queryIndex + 1);
  const params = new URLSearchParams(query);
  const token = params.get("token")?.trim();
  if (!token) {
    throw new Error("token is required");
  }

  return token;
}

function readInstitutionId(value: unknown): string {
  if (typeof value !== "string" || !/^[0-9]+$/.test(value)) {
    throw new Error("custom:institution_id must be numeric string");
  }
  return value;
}

function sanitizePrincipalId(value: string): string {
  const sanitized = value.replace(/[^a-zA-Z0-9]/g, "");
  if (!sanitized) {
    throw new Error("principalId is empty");
  }
  return sanitized.slice(0, 128);
}

function sanitizeClientId(value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    return "*";
  }

  return trimmed.replace(/[^a-zA-Z0-9:_-]/g, "_");
}
