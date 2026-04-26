import {
  type DsqlClientConfig,
  type DsqlRuntimeEnv,
  resolveDsqlClientConfigFromEnv,
} from "../db/client.ts";

/*
 * # マイグレーション用 DSQL 設定解決
 *
 * ## 目的
 * マイグレーション実行系（Lambda カスタムリソース）が、ランタイム接続と同一の env スキーマで設定を組み立てる入口。
 *
 * ## 説明
 * 中身は resolveDsqlClientConfigFromEnv そのまま。マイグレーション側で別バリデーション要件が出た場合に差し替えやすくする境界。
 */
export function resolveMigrationConfigFromEnv(env: DsqlRuntimeEnv): DsqlClientConfig {
  return resolveDsqlClientConfigFromEnv(env);
}
