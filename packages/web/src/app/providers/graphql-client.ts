import { cacheExchange, createClient, fetchExchange } from "urql";
import { readIdToken } from "@/domains/auth/lib/amplify-auth.ts";

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
    fetch: async (input, init) => {
      const token = await readIdToken();
      const headers = new Headers(init?.headers);
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return fetch(input, {
        ...init,
        headers,
      });
    },
    url,
  });
}
