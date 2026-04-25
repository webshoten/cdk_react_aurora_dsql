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

export function createDsqlClient(config: DsqlClientConfig): DbClient {
  return async <T>(fn: (client: Client) => Promise<T>): Promise<T> => {
    const token = await generateDsqlAdminAuthToken(config);
    const client = new Client({
      database: config.database,
      host: config.endpoint,
      password: token,
      port: config.port,
      ssl: {
        rejectUnauthorized: true,
      },
      user: config.user,
    });

    await client.connect();

    try {
      return await fn(client);
    } finally {
      await client.end();
    }
  };
}

export function createDsqlClientFromEnv(env: DsqlRuntimeEnv): DbClient {
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

  return createDsqlClient({
    database,
    endpoint,
    port: Number(port),
    region,
    user,
  });
}
