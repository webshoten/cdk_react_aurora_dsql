import { useTypedQuery } from "@pf/graphql-schema/urql";

/*
 * # currentUser Query フック
 *
 * ## 目的
 * MQTT topic 組み立てに必要な institutionId を currentUser から取得する。
 */
export function useCurrentUserQuery(pause: boolean) {
  return useTypedQuery({
    query: {
      currentUser: {
        institutionCode: true,
        username: true,
      },
    },
    pause,
  });
}
