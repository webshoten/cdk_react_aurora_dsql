import { cacheExchange, createClient, fetchExchange } from "urql";

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
    url,
  });
}
