import {
  resolveDsqlClientConfigFromEnv,
  type DsqlClientConfig,
  type DsqlRuntimeEnv,
} from "../db/client.ts";

export function resolveMigrationConfigFromEnv(env: DsqlRuntimeEnv): DsqlClientConfig {
  return resolveDsqlClientConfigFromEnv(env);
}
