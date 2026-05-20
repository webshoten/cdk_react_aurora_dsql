import type { Buffer } from "node:buffer";
import { buildIotEventTopic } from "@pf/mqtt-schema";
import mqtt, { type MqttClient } from "mqtt";
import { useCallback, useMemo, useRef, useState } from "react";
import { readIdToken } from "@/domains/auth/lib/amplify-auth.ts";

export type IotConnectionStatus = "idle" | "connecting" | "subscribed" | "unsubscribed" | "error";

export interface IotReceivedMessage {
  payloadText: string;
  receivedAt: string;
  topic: string;
}

interface UseIotSubscriptionInput {
  authorizerName: string;
  endpoint: string;
  sharedEnv: string;
  stage: string;
}

/*
 * # IoT subscribe フック
 *
 * ## 目的
 * MQTT over WebSocket 接続と subscribe/unsubscribe、受信メッセージ保持を 11-11 ページから分離する。
 */
export function useIotSubscription(input: UseIotSubscriptionInput) {
  const clientRef = useRef<MqttClient | null>(null);
  const subscribedTopicRef = useRef<string | null>(null);
  const [status, setStatus] = useState<IotConnectionStatus>("idle");
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [messages, setMessages] = useState<IotReceivedMessage[]>([]);

  const endpointUrl = useMemo(() => `wss://${input.endpoint}/mqtt`, [input.endpoint]);

  const unsubscribe = useCallback(async (): Promise<void> => {
    const client = clientRef.current;
    const subscribedTopic = subscribedTopicRef.current;
    if (client && subscribedTopic) {
      await new Promise<void>((resolve) => {
        client.unsubscribe(subscribedTopic, () => resolve());
      });
      subscribedTopicRef.current = null;
    }
    setStatus("unsubscribed");
    setStatusMessage("購読を解除しました");
  }, []);

  const subscribe = useCallback(
    async (roomId: string, institutionId: string): Promise<void> => {
      const trimmedRoomId = roomId.trim();
      const trimmedInstitutionId = institutionId.trim();
      if (!trimmedRoomId || !trimmedInstitutionId) {
        throw new Error("roomId と institutionId は必須です");
      }

      const idToken = await readIdToken();
      if (!idToken) {
        throw new Error("ID token を取得できません");
      }

      setStatus("connecting");
      setStatusMessage("接続中...");

      const topic = buildIotEventTopic({
        sharedEnv: input.sharedEnv,
        stage: input.stage,
        medicalInstitutionId: trimmedInstitutionId,
        roomId: trimmedRoomId,
      });

      const username = `web-client?x-amz-customauthorizer-name=${encodeURIComponent(input.authorizerName)}&token=${encodeURIComponent(idToken)}`;
      const clientId = `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

      const client = mqtt.connect(endpointUrl, {
        clientId,
        clean: true,
        connectTimeout: 10_000,
        reconnectPeriod: 0,
        username,
      });

      clientRef.current = client;

      await new Promise<void>((resolve, reject) => {
        client.once("connect", () => {
          client.subscribe(topic, { qos: 0 }, (error?: Error | null) => {
            if (error) {
              reject(error);
              return;
            }
            subscribedTopicRef.current = topic;
            setStatus("subscribed");
            setStatusMessage(`購読中: ${topic}`);
            resolve();
          });
        });

        client.on("message", (messageTopic: string, payload: Buffer) => {
          const payloadText = payload.toString("utf8");
          setMessages((prev) => [
            {
              topic: messageTopic,
              payloadText,
              receivedAt: new Date().toISOString(),
            },
            ...prev,
          ]);
        });

        client.once("error", (error: Error) => {
          setStatus("error");
          setStatusMessage(error.message);
          reject(error);
        });

        client.once("close", () => {
          setStatus((prev) => (prev === "unsubscribed" ? prev : "idle"));
        });
      });
    },
    [endpointUrl, input.authorizerName, input.sharedEnv, input.stage],
  );

  return {
    messages,
    status,
    statusMessage,
    subscribe,
    unsubscribe,
  };
}
