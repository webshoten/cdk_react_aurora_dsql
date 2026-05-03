import { cacheExchange, createClient, fetchExchange } from "urql";
import { getCachedAccessToken } from "@/domains/auth/lib/amplify-auth.ts";

/*
 * # GraphQL クライアント生成
 *
 * ## 目的
 * urql クライアント初期化を一箇所へ集約し、将来の exchange 追加を容易にする。
 *
 * ## 説明
 * 現時点では最小構成（cache + fetch）で生成する。
 */
export function createGraphqlClient(url: string) {
  return createClient({
    exchanges: [cacheExchange, fetchExchange],
    fetchOptions: () => {
      const token = getCachedAccessToken();
      if (!token) return {};
      return {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    },
    url,
  });
}
