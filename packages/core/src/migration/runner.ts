import * as fs from "node:fs";
import * as path from "node:path";
import type { Client } from "pg";
import { createConnectedDsqlPgClient, type DsqlClientConfig } from "../db/client.ts";

export interface MigrationRunnerOptions {
  migrationsSchema?: string;
  migrationsTable?: string;
  migrationsFolder?: string;
  runMigration?: boolean;
  seedsFolder?: string;
  runSeed?: boolean;
}

export interface MigrationRunnerResult {
  migrationExecuted: boolean;
  seedAppliedIds: string[];
}

/*
 * # マイグレーション + シード一括実行
 *
 * ## 目的
 * マイグレーション Lambda が呼び出すコア処理。接続生成 → migration → seed → close を一括で完結する。
 *
 * ## 説明
 * options.runMigration / runSeed で個別スキップ可。pg.Client の close は finally で保証。
 */
export async function runDsqlMigrationAndSeed(
  config: DsqlClientConfig,
  options: MigrationRunnerOptions = {},
): Promise<MigrationRunnerResult> {
  const runMigration = options.runMigration ?? true;
  const runSeed = options.runSeed ?? true;
  const migrationsFolder = options.migrationsFolder ?? defaultMigrationsFolder();
  const migrationsSchema = options.migrationsSchema ?? defaultMigrationsSchema();
  const migrationsTable = options.migrationsTable ?? defaultMigrationsTable();
  const seedsFolder = options.seedsFolder ?? defaultSeedsFolder();
  const client = await createConnectedDsqlPgClient(config);

  try {
    const migrationExecuted = runMigration
      ? await runMigrations(client, migrationsFolder, { migrationsSchema, migrationsTable })
      : false;
    const seedAppliedIds = runSeed ? await runSeeds(client, seedsFolder) : [];

    return {
      migrationExecuted,
      seedAppliedIds,
    };
  } finally {
    await client.end();
  }
}

/*
 * # マイグレーション SQL 実行
 *
 * ## 目的
 * runDsqlMigrationAndSeed 内部で利用される migration 実行本体。
 *
 * ## 説明
 * 履歴テーブルを ensure → ファイル名昇順で未適用のみ実行 → 履歴 INSERT。
 * DSQL は DDL と DML を同一トランザクションに混在させられないため、SQL 実行と履歴 INSERT を分離した個別クエリで発行する。
 *
 * ## NOTE
 * - 外部からは利用されていない。エクスポートを取るかテスト都合で残すか要判断。
 */
export async function runMigrations(
  client: Client,
  migrationsFolder: string,
  options: { migrationsSchema: string; migrationsTable?: string },
): Promise<boolean> {
  const files = listSqlFiles(migrationsFolder);
  const migrationsSchema = validateIdentifier(options.migrationsSchema, "migrationsSchema");
  const migrationsTable = validateIdentifier(
    options.migrationsTable ?? defaultMigrationsTable(),
    "migrationsTable",
  );

  await ensureMigrationHistoryTable(client, migrationsSchema, migrationsTable);

  for (const file of files) {
    const sqlText = fs.readFileSync(file.path, "utf8");
    try {
      const exists = await client.query<{ id: string }>(
        `SELECT id FROM ${qualifyTableName(migrationsSchema, migrationsTable)} WHERE id = $1 LIMIT 1`,
        [file.id],
      );

      if (exists.rowCount === 0) {
        await client.query(sqlText);
        await client.query(
          `INSERT INTO ${qualifyTableName(migrationsSchema, migrationsTable)} (id) VALUES ($1)`,
          [file.id],
        );
      }
    } catch (error) {
      throw new Error(`Migration failed: ${file.id}`, { cause: error });
    }
  }

  return true;
}

/*
 * # シード SQL 実行
 *
 * ## 目的
 * runDsqlMigrationAndSeed 内部で利用される seed 実行本体。
 *
 * ## 説明
 * 各ファイルを BEGIN/COMMIT で個別トランザクション。失敗時 ROLLBACK して即 throw（後続停止）。
 * 履歴管理なし（毎回再適用前提のシード）。
 *
 * ## NOTE
 * - 外部からは利用されていない。
 * - 履歴を持たないため冪等性はシード SQL 自身（ON CONFLICT 等）に依存。
 */
export async function runSeeds(client: Client, seedsFolder: string): Promise<string[]> {
  const files = listSqlFiles(seedsFolder);
  const applied: string[] = [];

  for (const file of files) {
    const sqlText = fs.readFileSync(file.path, "utf8");
    await client.query("BEGIN");
    try {
      await client.query(sqlText);
      applied.push(file.id);

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }

  return applied;
}

function defaultMigrationsFolder(): string {
  return process.env.MIGRATIONS_DIR ?? path.resolve(process.cwd(), "db/migrations");
}

function defaultMigrationsSchema(): string {
  return process.env.MIGRATIONS_SCHEMA ?? "public";
}

function defaultMigrationsTable(): string {
  return process.env.MIGRATIONS_TABLE ?? "pf_migration_files";
}

function defaultSeedsFolder(): string {
  return process.env.SEEDS_DIR ?? path.resolve(process.cwd(), "db/seeds");
}

function listSqlFiles(dir: string): Array<{ id: string; path: string }> {
  const entries = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => ({
      id: entry.name.replace(/\.sql$/, ""),
      path: path.join(dir, entry.name),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  return entries;
}

function ensureMigrationHistoryTable(
  client: Client,
  schema: string,
  table: string,
): Promise<unknown> {
  return client.query(
    `CREATE TABLE IF NOT EXISTS ${qualifyTableName(schema, table)} (
      id text PRIMARY KEY NOT NULL,
      applied_at timestamp with time zone DEFAULT now() NOT NULL
    )`,
  );
}

function qualifyTableName(schema: string, table: string): string {
  return `${quoteIdentifier(schema)}.${quoteIdentifier(table)}`;
}

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replaceAll('"', '""')}"`;
}

function validateIdentifier(value: string, label: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) {
    throw new Error(`${label} is invalid: ${value}`);
  }

  return value;
}
