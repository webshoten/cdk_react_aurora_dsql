import type { IotReceivedMessage } from "../hooks/use-iot-subscription.ts";

interface IotMessageListProps {
  messages: IotReceivedMessage[];
}

/*
 * # MQTT 受信一覧
 *
 * ## 目的
 * subscribe 中に受信した topic/payload を時系列で表示する。
 */
export function IotMessageList(props: IotMessageListProps) {
  if (props.messages.length === 0) {
    return <p className="text-sm text-muted-foreground">まだ受信していません。</p>;
  }

  return (
    <div className="space-y-2">
      {props.messages.map((message, index) => (
        <div className="rounded border border-border p-3 text-xs" key={`${message.receivedAt}-${index.toString()}`}>
          <p>
            <span className="font-medium">receivedAt:</span> {message.receivedAt}
          </p>
          <p>
            <span className="font-medium">topic:</span> {message.topic}
          </p>
          <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-all rounded bg-muted/40 p-2">
            {message.payloadText}
          </pre>
        </div>
      ))}
    </div>
  );
}

