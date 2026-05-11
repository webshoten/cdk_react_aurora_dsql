import { useMemo, useState } from "react";
import { resolveConfigError, resolveIotConfig } from "@/app/config/runtime-config.ts";
import { useAuth } from "@/domains/auth/context/auth-context.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card.tsx";
import { IotMessageList } from "../components/iot-message-list.tsx";
import { IotSubscribeControls } from "../components/iot-subscribe-controls.tsx";
import { useCurrentUserQuery } from "../hooks/use-current-user-query.ts";
import { useIotStatesByRoomQuery } from "../hooks/use-iot-states-by-room-query.ts";
import { usePublishOnStartRoomMutation } from "../hooks/use-publish-on-start-room-mutation.ts";
import { useIotSubscription } from "../hooks/use-iot-subscription.ts";

/*
 * # 11-11.iot-01 ページ
 *
 * ## 目的
 * MQTT subscribe / unsubscribe と受信表示を 1 画面で検証する。
 */
export function Iot01Page() {
  const [roomId, setRoomId] = useState("");
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
  const [{ data: iotStatesData, fetching: isIotStatesFetching, error: iotStatesError }] =
    useIotStatesByRoomQuery(roomId, Boolean(configError) || authState !== "authenticated");

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
        <CardTitle>11-11.iot-01</CardTitle>
        <CardDescription>MQTT subscribe / unsubscribe と受信表示を検証します。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <section className="text-sm">
          <p className="font-medium">Realtime検証導線: 1画面で publish -&gt; subscribe -&gt; 保存確認までを通す</p>
          <ul className="list-disc pl-6">
            <li>`subscribe -&gt; mutation publish -&gt; Web受信 -&gt; Lambda発火 -&gt; DynamoDB query` を連続確認する</li>
            <li>Web から MQTT publish は行わず、publish は GraphQL mutation 経由で backend が実行する</li>
            <li>受信確認は MQTT メッセージ表示、保存確認は `iotStatesByRoom` の query 結果で行う</li>
          </ul>
        </section>

        <section className="text-sm">
          <p className="font-medium">前提条件: 接続・認可に必要な入力と設定を満たす</p>
          <ul className="list-disc pl-6">
            <li>認証済みユーザーでログイン済みであること</li>
            <li>`custom:institution_id` を持つユーザーであること（`currentUser.institutionCode` が空でない）</li>
            <li>`config.js` に `iotEndpoint / iotAuthorizerName / sharedEnv / stage` が設定されていること</li>
            <li>`roomId` 入力時のみ subscribe/publish/query を有効化する</li>
          </ul>
        </section>

        <section className="text-sm">
          <p className="font-medium">このページで確認する仕様</p>
          <ul className="list-disc pl-6">
            <li>Subscribe ボタンで接続し、Unsubscribe で解除できること</li>
            <li>`Publish onStartRoom` 実行後に topic と publish 結果が表示されること</li>
            <li>受信欄に MQTT メッセージが表示されること</li>
            <li>DynamoDB 保存結果が GraphQL query で確認できること</li>
            <li>`roomId` 未入力時は query を実行しないこと</li>
          </ul>
        </section>

        <div className="rounded border border-border p-4 text-xs">
          <p>sharedEnv: {iotConfig?.sharedEnv ?? "(config未設定)"}</p>
          <p>stage: {iotConfig?.stage ?? "(config未設定)"}</p>
          <p>iotEndpoint: {iotConfig?.iotEndpoint ?? "(config未設定)"}</p>
          <p>authorizer: {iotConfig?.iotAuthorizerName ?? "(config未設定)"}</p>
          <p>institutionId: {institutionId || "(currentUser未設定)"}</p>
          {isCurrentUserFetching ? <p>currentUser 読み取り中...</p> : null}
          {currentUserError ? <p className="text-destructive">{currentUserError.message}</p> : null}
          {!iotConfig ? <p className="text-destructive">config.js の IoT 設定が未設定です。</p> : null}
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
              <p className="mt-2 text-xs text-muted-foreground">roomId 未入力時は publish できません。</p>
            ) : null}
            {publishData?.publishOnStartRoom ? (
              <div className="mt-2 rounded border border-border p-2 text-xs">
                <p>published: {publishData.publishOnStartRoom.published ? "true" : "false"}</p>
                <p>topic: {publishData.publishOnStartRoom.topic}</p>
              </div>
            ) : null}
            {publishError ? <p className="mt-2 text-xs text-destructive">{publishError.message}</p> : null}
          </div>
          <div className="rounded border border-border p-4">
            <p className="mb-2 text-sm font-medium">受信</p>
            <IotMessageList messages={subscription.messages} />
          </div>
        </div>

        <div className="rounded border border-border p-4">
          <p className="mb-2 text-sm font-medium">DynamoDB 保存結果（GraphQL query）</p>
          {!roomId.trim() ? (
            <p className="text-xs text-muted-foreground">roomId 未入力時は query を実行しません。</p>
          ) : null}
          {isIotStatesFetching ? <p className="text-xs text-muted-foreground">読み取り中...</p> : null}
          {iotStatesError ? <p className="text-xs text-destructive">{iotStatesError.message}</p> : null}
          {(iotStatesData?.iotStatesByRoom ?? []).length === 0 && roomId.trim() ? (
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
                {state.roomStateJson ? <pre className="mt-1 overflow-x-auto">{state.roomStateJson}</pre> : null}
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
