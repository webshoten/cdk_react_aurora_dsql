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

export async function runMigrations(
  client: Client,
  migrationsFolder: string,
  options: { migrationsSchema: string; migrationsTable?: string },
): Promise<boolean> {
  // DSQL 制約:
  // - DDL と DML を同一トランザクションで実行できない
  // そのため migration SQL（DDL想定）と履歴INSERT（DML）は明示的に分離して実行する。
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
        // DSQL では DDL と DML を同一トランザクションで実行できないため、
        // migration SQL（DDL想定）と履歴INSERTは分離して実行する。
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
