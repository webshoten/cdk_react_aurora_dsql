import { DsqlSigner } from "@aws-sdk/dsql-signer";
import { Client } from "pg";
import type { DbClient } from "./types.ts";

export interface DsqlClientConfig {
  database: string;
  endpoint: string;
  port: number;
  region: string;
  user: string;
}

/*
 * # DSQL Admin 認証トークン発行
 *
 * ## 目的
 * GraphQL リクエスト処理とマイグレーション実行、両系統の DB 接続が必要とする
 * 短命認証トークンを供給する。
 *
 * ## 説明
 * IAM 署名で生成。admin ロール固定。
 *
 * ## NOTE
 * - 引数の Config から実際に使うのは endpoint と region のみ。型統一を優先しているだけ。
 * - admin 固定。非 admin 接続したい場合は別関数（getDbConnectAuthToken）に分岐が必要。
 */
export async function generateDsqlAdminAuthToken(config: DsqlClientConfig): Promise<string> {
  const signer = new DsqlSigner({
    hostname: config.endpoint,
    region: config.region,
  });

  return signer.getDbConnectAdminAuthToken();
}

export interface DsqlRuntimeEnv {
  DSQL_DATABASE?: string;
  DSQL_DB_USER?: string;
  DSQL_ENDPOINT?: string;
  DSQL_PORT?: string;
  DSQL_REGION?: string;
}

/*
 * # 環境変数 → DSQL 接続設定
 *
 * ## 目的
 * GraphQL と migration で共有する設定組み立て処理を一元化する。
 *
 * ## 説明
 * 必須キー欠落は早期に throw し、正常時は DsqlClientConfig を返す。
 */
export function resolveDsqlClientConfigFromEnv(env: DsqlRuntimeEnv): DsqlClientConfig {
  const database = env.DSQL_DATABASE;
  const endpoint = env.DSQL_ENDPOINT;
  const port = env.DSQL_PORT;
  const region = env.DSQL_REGION;
  const user = env.DSQL_DB_USER;

  if (!database || !endpoint || !port || !region || !user) {
    throw new Error(
      "DSQL_DATABASE, DSQL_ENDPOINT, DSQL_PORT, DSQL_REGION, and DSQL_DB_USER are required",
    );
  }

  return {
    database,
    endpoint,
    port: Number(port),
    region,
    user,
  };
}

/*
 * # DSQL 接続済み pg.Client 生成
 *
 * ## 目的
 * GraphQL リクエスト処理（短命接続）とマイグレーション実行（長尺トランザクション）の
 * 両系統が共有する接続生成基盤。
 *
 * ## 説明
 * 認証トークン取得 → クライアント生成 → connect まで実施。close は呼び出し側責任。
 *
 * ## NOTE
 * - connectionTimeoutMillis / statement_timeout 未設定。経路ハング時に Lambda タイムアウトまで待つ可能性。
 *   既定値を持たせるか、呼び出しごとに上限を渡す方が安全。
 */
export async function createConnectedDsqlPgClient(config: DsqlClientConfig): Promise<Client> {
  const token = await generateDsqlAdminAuthToken(config);
  const client = new Client({
    database: config.database,
    host: config.endpoint,
    password: token,
    port: config.port,
    // DSQL は TLS 必須。サーバー証明書検証も有効にする。
    ssl: {
      rejectUnauthorized: true,
    },
    user: config.user,
  });

  await client.connect();
  return client;
}

/*
 * # DbClient ファクトリ（操作ごとに接続を張り直す）
 *
 * ## 目的
 * GraphQL Lambda がリクエスト単位で DB 操作を行うための短命接続スコープを提供する。
 *
 * ## 説明
 * fn 実行を try/finally で包み、終了時に必ず close。長寿命プールを保持しない設計。
 */
export function createDsqlClient(config: DsqlClientConfig): DbClient {
  return async <T>(fn: (client: Client) => Promise<T>): Promise<T> => {
    const client = await createConnectedDsqlPgClient(config);

    try {
      return await fn(client);
    } finally {
      await client.end();
    }
  };
}

/*
 * # 環境変数 → DbClient
 *
 * ## 目的
 * GraphQL Lambda ランタイムの DB 接続入口。env から DbClient を組み立てる。
 *
 * ## 説明
 * 必須キー欠落は早期に throw。正常時は組み立てた接続スコープを返す。
 *
 * ## NOTE
 * - throw メッセージが必須キーを全部羅列するだけで、どれが欠けたか特定できない。
 *   欠落キーのみ列挙する方がデバッグしやすい。
 */
export function createDsqlClientFromEnv(env: DsqlRuntimeEnv): DbClient {
  return createDsqlClient(resolveDsqlClientConfigFromEnv(env));
}
