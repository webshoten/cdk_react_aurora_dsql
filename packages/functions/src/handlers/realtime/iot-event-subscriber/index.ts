import type { IoTHandler } from "aws-lambda";
import { validateIotEventInput } from "@functions/domains/realtime/iot-event-subscriber.ts";
import { upsertIotStateFromEvent } from "@functions/domains/realtime/iot-state-upsert.ts";

/*
 * # IoT Event Subscriber Handler
 *
 * ## 目的
 * IoT TopicRule から受け取った event payload をログ出力し、publish -> Lambda 発火確認の入口を提供する。
 */
export const handler: IoTHandler = async (event) => {
  console.log(JSON.stringify({ message: "IotEventSubscriber received payload", event }));

  const validation = validateIotEventInput(event);
  if (!validation.ok) {
    console.warn(
      JSON.stringify({
        message: "IotEventSubscriber validation failed",
        reason: validation.reason,
      }),
    );
    return;
  }

  console.log(
    JSON.stringify({
      message: "IotEventSubscriber validation passed",
      eventType: validation.eventType,
      topic: validation.topic,
      topicParts: validation.topicParts,
    }),
  );

  await upsertIotStateFromEvent(event);
  console.log(
    JSON.stringify({
      message: "IotEventSubscriber state upsert completed",
      eventType: validation.eventType,
      topic: validation.topic,
    }),
  );
};
