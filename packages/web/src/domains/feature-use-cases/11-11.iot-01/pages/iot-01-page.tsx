import { useMemo, useState } from "react";
import { resolveConfigError, resolveIotConfig } from "@/app/config/runtime-config.ts";
import { useAuth } from "@/domains/auth/context/auth-context.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card.tsx";
import { IotMessageList } from "../components/iot-message-list.tsx";
import { IotSubscribeControls } from "../components/iot-subscribe-controls.tsx";
import { useCurrentUserQuery } from "../hooks/use-current-user-query.ts";
import { useIotStatesByRoomQuery } from "../hooks/use-iot-states-by-room-query.ts";
import { useIotSubscription } from "../hooks/use-iot-subscription.ts";
import { usePublishOnStartRoomMutation } from "../hooks/use-publish-on-start-room-mutation.ts";

/*
 * # 11-11.iot-01 ページ
 *
 * ## 目的
 * MQTT subscribe / unsubscribe と受信表示を 1 画面で検証する。
 */
export function Iot01Page() {
  const [roomId, setRoomId] = useState("");
  const [queryRoomId, setQueryRoomId] = useState("");
  const { authState } = useAuth();
  const configError = resolveConfigError();
  const iotConfig = resolveIotConfig();

  const [{ data: currentUserData, fetching: isCurrentUserFetching, error: currentUserError }] =
    useCurrentUserQuery(Boolean(configError) || authState !== "authenticated");
  const institutionId = currentUserData?.currentUser?.institutionCode?.trim() ?? "";

  const subscription = useIotSubscription({
    endpoint: iotConfig?.iotEndpoint ?? "",
    authorizerName: iotConfig?.iotAuthorizerName ?? "",
    sharedEnv: iotConfig?.sharedEnv ?? "",
    stage: iotConfig?.stage ?? "",
  });
  const [{ data: publishData, fetching: isPublishing, error: publishError }, publishOnStartRoom] =
    usePublishOnStartRoomMutation();
  const [{ data: iotStatesData, fetching: isIotStatesFetching, error: iotStatesError }, reexecuteIotStatesQuery] =
    useIotStatesByRoomQuery(queryRoomId, Boolean(configError) || authState !== "authenticated");

  const canSubscribe = useMemo(() => {
    if (!iotConfig) return false;
    if (!roomId.trim()) return false;
    if (!institutionId) return false;
    if (authState !== "authenticated") return false;
    return true;
  }, [authState, institutionId, iotConfig, roomId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>11-11.iot-01 Realtime</CardTitle>
        <CardDescription>MQTT subscribe / unsubscribe と保存確認（GraphQL）</CardDescription>
        <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
          <p className="font-medium">このページで確認する仕様</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>Subscribe ボタンで接続し、Unsubscribe で解除できること</li>
            <li>`Publish onStartRoom` 実行後に topic と publish 結果が表示されること</li>
            <li>受信欄に MQTT メッセージが表示されること</li>
            <li>DynamoDB 保存結果が GraphQL query で確認できること</li>
            <li>`roomId` 未入力時は query を実行しないこと</li>
          </ul>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">

        <div className="rounded border border-border p-4 text-xs">
          <p>sharedEnv: {iotConfig?.sharedEnv ?? "(config未設定)"}</p>
          <p>stage: {iotConfig?.stage ?? "(config未設定)"}</p>
          <p>iotEndpoint: {iotConfig?.iotEndpoint ?? "(config未設定)"}</p>
          <p>authorizer: {iotConfig?.iotAuthorizerName ?? "(config未設定)"}</p>
          <p>institutionId: {institutionId || "(currentUser未設定)"}</p>
          {isCurrentUserFetching ? <p>currentUser 読み取り中...</p> : null}
          {currentUserError ? <p className="text-destructive">{currentUserError.message}</p> : null}
          {!iotConfig ? (
            <p className="text-destructive">config.js の IoT 設定が未設定です。</p>
          ) : null}
          {configError ? <p className="text-destructive">{configError}</p> : null}
        </div>

        <IotSubscribeControls
          canSubscribe={canSubscribe}
          isSubscribed={subscription.status === "subscribed"}
          onRoomIdChange={setRoomId}
          onSubscribe={async () => {
            await subscription.subscribe(roomId, institutionId);
          }}
          onUnsubscribe={subscription.unsubscribe}
          roomId={roomId}
          status={subscription.status}
          statusMessage={subscription.statusMessage}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded border border-border p-4">
            <p className="text-sm font-medium">送信</p>
            <button
              className="mt-2 rounded bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
              disabled={!roomId.trim() || isPublishing}
              onClick={async () => {
                await publishOnStartRoom({
                  roomId: roomId.trim(),
                  startedAt: new Date().toISOString(),
                });
              }}
              type="button"
            >
              Publish onStartRoom
            </button>
            {!roomId.trim() ? (
              <p className="mt-2 text-xs text-muted-foreground">
                roomId 未入力時は publish できません。
              </p>
            ) : null}
            {publishData?.publishOnStartRoom ? (
              <div className="mt-2 rounded border border-border p-2 text-xs">
                <p>published: {publishData.publishOnStartRoom.published ? "true" : "false"}</p>
                <p>topic: {publishData.publishOnStartRoom.topic}</p>
              </div>
            ) : null}
            {publishError ? (
              <p className="mt-2 text-xs text-destructive">{publishError.message}</p>
            ) : null}
          </div>
          <div className="rounded border border-border p-4">
            <p className="mb-2 text-sm font-medium">受信</p>
            <IotMessageList messages={subscription.messages} />
          </div>
        </div>

        <div className="rounded border border-border p-4">
          <p className="mb-2 text-sm font-medium">DynamoDB 保存結果（GraphQL query）</p>
          <button
            className="rounded bg-primary px-3 py-1 text-xs text-primary-foreground disabled:opacity-50"
            disabled={!roomId.trim() || authState !== "authenticated" || Boolean(configError)}
            onClick={() => {
              const nextRoomId = roomId.trim();
              if (!nextRoomId) return;
              if (nextRoomId === queryRoomId) {
                reexecuteIotStatesQuery({ requestPolicy: "network-only" });
                return;
              }
              setQueryRoomId(nextRoomId);
            }}
            type="button"
          >
            保存結果を取得
          </button>
          {!roomId.trim() ? (
            <p className="text-xs text-muted-foreground">
              roomId 未入力時は query を実行しません。
            </p>
          ) : null}
          {isIotStatesFetching ? (
            <p className="text-xs text-muted-foreground">読み取り中...</p>
          ) : null}
          {iotStatesError ? (
            <p className="text-xs text-destructive">{iotStatesError.message}</p>
          ) : null}
          {(iotStatesData?.iotStatesByRoom ?? []).length === 0 && queryRoomId ? (
            <p className="text-xs text-muted-foreground">保存結果はまだありません。</p>
          ) : null}
          <div className="space-y-2">
            {(iotStatesData?.iotStatesByRoom ?? []).map((state, index) => (
              <div
                className="rounded border border-border p-2 text-xs"
                key={`${state.entityType}-${state.updatedAt}-${index.toString()}`}
              >
                <p>entityType: {state.entityType}</p>
                <p>event: {state.event}</p>
                <p>updatedAt: {state.updatedAt}</p>
                <p>topic: {state.topic}</p>
                {state.roomStateJson ? (
                  <pre className="mt-1 overflow-x-auto">{state.roomStateJson}</pre>
                ) : null}
                {state.patientStateJson ? (
                  <pre className="mt-1 overflow-x-auto">{state.patientStateJson}</pre>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
