import { resolveMigrationConfigFromEnv, runDsqlMigrationAndSeed } from "@pf/core";
import type { Handler } from "aws-lambda";

interface MigrationInvokeEvent {
  migration?: {
    enabled?: boolean;
  };
  requestId?: string;
  seed?: {
    enabled?: boolean;
  };
  sharedEnv?: string;
  stage?: string;
}

interface MigrationInvokeResult {
  durationMs: number;
  migration: {
    executed: boolean;
  };
  ok: boolean;
  requestId?: string;
  seed: {
    appliedIds: string[];
  };
  sharedEnv?: string;
  stage?: string;
}

function serializeUnknownError(error: unknown): Record<string, unknown> {
  if (!(error instanceof Error)) {
    return { raw: String(error) };
  }

  const pgError = error as Error & {
    code?: string;
    detail?: string;
    hint?: string;
    position?: string;
    schema?: string;
    table?: string;
    column?: string;
    routine?: string;
    where?: string;
  };

  const serialized: Record<string, unknown> = {
    message: error.message,
    name: error.name,
    stack: error.stack,
  };

  if (error.cause) {
    serialized.cause =
      error.cause instanceof Error
        ? {
            message: error.cause.message,
            name: error.cause.name,
            stack: error.cause.stack,
          }
        : String(error.cause);
  }

  if (pgError.code) serialized.code = pgError.code;
  if (pgError.detail) serialized.detail = pgError.detail;
  if (pgError.hint) serialized.hint = pgError.hint;
  if (pgError.position) serialized.position = pgError.position;
  if (pgError.schema) serialized.schema = pgError.schema;
  if (pgError.table) serialized.table = pgError.table;
  if (pgError.column) serialized.column = pgError.column;
  if (pgError.routine) serialized.routine = pgError.routine;
  if (pgError.where) serialized.where = pgError.where;

  return serialized;
}

export const handler: Handler<MigrationInvokeEvent, MigrationInvokeResult> = async (event) => {
  const startedAt = Date.now();
  const requestId = event.requestId;
  const stage = event.stage ?? process.env.STAGE;
  const sharedEnv = event.sharedEnv ?? process.env.SHARED_ENV;

  console.log(
    JSON.stringify({
      event: "migration.invoke.start",
      requestId,
      sharedEnv,
      stage,
    }),
  );

  try {
    const config = resolveMigrationConfigFromEnv(process.env);
    const result = await runDsqlMigrationAndSeed(config, {
      runMigration: event.migration?.enabled ?? true,
      runSeed: event.seed?.enabled ?? true,
    });

    const response: MigrationInvokeResult = {
      durationMs: Date.now() - startedAt,
      migration: {
        executed: result.migrationExecuted,
      },
      ok: true,
      requestId,
      seed: {
        appliedIds: result.seedAppliedIds,
      },
      sharedEnv,
      stage,
    };

    console.log(
      JSON.stringify({
        event: "migration.invoke.success",
        ...response,
      }),
    );

    return response;
  } catch (error) {
    const response: MigrationInvokeResult = {
      durationMs: Date.now() - startedAt,
      migration: { executed: false },
      ok: false,
      requestId,
      seed: { appliedIds: [] },
      sharedEnv,
      stage,
    };

    console.error(
      JSON.stringify({
        error: serializeUnknownError(error),
        event: "migration.invoke.failed",
        ...response,
      }),
    );

    return response;
  }
};
