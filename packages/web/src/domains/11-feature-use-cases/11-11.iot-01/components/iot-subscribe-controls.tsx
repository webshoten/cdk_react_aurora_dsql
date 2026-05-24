interface IotSubscribeControlsProps {
  canSubscribe: boolean;
  isSubscribed: boolean;
  onRoomIdChange: (value: string) => void;
  onSubscribe: () => Promise<void>;
  onUnsubscribe: () => Promise<void>;
  roomId: string;
  status: string;
  statusMessage: string;
  subscribeTopicLabel: string;
}

/*
 * # 購読操作コンポーネント
 *
 * ## 目的
 * roomId 入力と subscribe / unsubscribe 操作を表示する。
 */
export function IotSubscribeControls(props: IotSubscribeControlsProps) {
  return (
    <div className="space-y-3 rounded border border-border p-4">
      <p className="text-sm font-medium">共通操作</p>
      <input
        className="w-full rounded border border-border px-3 py-2 text-sm"
        onChange={(event) => props.onRoomIdChange(event.target.value)}
        placeholder="room-001"
        value={props.roomId}
      />
      <div className="flex gap-2">
        <button
          className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
          disabled={!props.canSubscribe || props.isSubscribed}
          onClick={() => {
            void props.onSubscribe();
          }}
          type="button"
        >
          Subscribe
        </button>
        <button
          className="rounded bg-secondary px-4 py-2 text-sm disabled:opacity-50"
          disabled={!props.isSubscribed}
          onClick={() => {
            void props.onUnsubscribe();
          }}
          type="button"
        >
          Unsubscribe
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        状態: {props.status}
        {props.statusMessage ? ` / ${props.statusMessage}` : ""}
      </p>
      <p className="text-xs text-muted-foreground">該当 topic: {props.subscribeTopicLabel}</p>
    </div>
  );
}
