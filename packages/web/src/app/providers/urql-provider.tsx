import type { PropsWithChildren } from "react";
import { Provider } from "urql";
import { resolveGraphqlUrl } from "@/app/config/runtime-config.ts";
import { createGraphqlClient } from "@/app/providers/graphql-client.ts";

const graphqlUrl = resolveGraphqlUrl();
const client = createGraphqlClient(graphqlUrl ?? "http://localhost:0/graphql");

/*
 * # GraphQL クライアントのアプリ全体注入
 *
 * ## 目的
 * urql の Provider をアプリツリー直下に置き、全コンポーネントから GraphQL クライアントを参照可能にする。
 *
 * ## 説明
 * モジュール初期化時に runtime config から URL を解決して 1 回だけ client を生成。Provider 自体はラッパーなしの薄いコンポーネント。
 *
 * ## NOTE
 * - graphqlUrl 未解決時は "http://localhost:0/graphql" をダミー注入し、初回 fetch 時にネットワークエラーで失敗させる設計（Provider 構築自体は通る）。エラー UI 表示は呼び出し側の resolveConfigError と組み合わせて行う。
 */
export function UrqlProvider({ children }: PropsWithChildren) {
  return <Provider value={client}>{children}</Provider>;
}
