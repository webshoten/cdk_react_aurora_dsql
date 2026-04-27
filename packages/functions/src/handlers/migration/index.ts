import * as fs from "node:fs";
import * as path from "node:path";
import { Readable } from "node:stream";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { resolveMigrationConfigFromEnv, runDsqlMigrationAndSeed } from "@pf/core";
import type { Handler } from "aws-lambda";
import { unzipSync } from "fflate";

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

interface PreparedArtifactDirs {
  cleanup(): Promise<void>;
  migrationsDir: string;
  seedsDir: string;
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

function requireEnv(name: "ARTIFACT_S3_BUCKET" | "ARTIFACT_S3_KEY"): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function sanitizeForPath(input: string): string {
  const value = input.replaceAll(/[^a-zA-Z0-9_-]/g, "_");
  return value.length > 0 ? value : "default";
}

/*
 * # Migration / Seed SQL 配置パス検証
 *
 * ## 目的
 * S3 から取得した migration / seed SQL zip の各エントリパスを /tmp 配下へ展開する前に検証する。
 *
 * ## 説明
 * 絶対パス・親参照（`../`）を含むエントリは zip-slip として弾く。POSIX 正規化後に判定。
 */
function normalizeArtifactPath(entryPath: string): string {
  const normalized = path.posix.normalize(entryPath);
  if (normalized.startsWith("/") || normalized.startsWith("../") || normalized.includes("/../")) {
    throw new Error(`Invalid SQL zip path: ${entryPath}`);
  }
  return normalized;
}

async function bodyToUint8Array(body: unknown): Promise<Uint8Array> {
  if (
    typeof body === "object" &&
    body !== null &&
    "transformToByteArray" in body &&
    typeof body.transformToByteArray === "function"
  ) {
    return body.transformToByteArray();
  }

  if (body instanceof Readable) {
    const chunks: Buffer[] = [];
    for await (const chunk of body) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  throw new Error("Unsupported S3 response body type");
}

/*
 * # マイグレーション資材の S3 → /tmp 展開
 *
 * ## 目的
 * マイグレーション Lambda 起動時に S3 上の zip（migrations/**.sql, seeds/**.sql）を /tmp 下に展開し、runner が読むディレクトリを供給する。
 *
 * ## 説明
 * - リクエストごとに一意な /tmp サブディレクトリを切る（並行実行衝突回避）
 * - .sql ファイル以外、許可プレフィックス外はスキップ
 * - cleanup でディレクトリ削除（呼び出し側 finally で実行）
 *
 * ## NOTE
 * - リージョンは AWS_REGION → DSQL_REGION fallback。Lambda 環境では AWS_REGION 必ず存在のはずだが冗長化。
 */
async function prepareArtifactDirs(requestId?: string): Promise<PreparedArtifactDirs> {
  const bucket = requireEnv("ARTIFACT_S3_BUCKET");
  const key = requireEnv("ARTIFACT_S3_KEY");
  const region = process.env.AWS_REGION ?? process.env.DSQL_REGION;
  const s3 = new S3Client({ region });
  const safeRequestId = sanitizeForPath(requestId ?? `${Date.now()}`);
  const baseDir = path.join("/tmp", "migration-artifact", safeRequestId);
  const migrationsDir = path.join(baseDir, "migrations");
  const seedsDir = path.join(baseDir, "seeds");

  fs.mkdirSync(migrationsDir, { recursive: true });
  fs.mkdirSync(seedsDir, { recursive: true });

  const response = await s3.send(
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );

  const archiveBytes = await bodyToUint8Array(response.Body);
  const entries = unzipSync(archiveBytes);

  for (const [entryPath, content] of Object.entries(entries)) {
    const normalized = normalizeArtifactPath(entryPath);
    if (!normalized.endsWith(".sql")) {
      continue;
    }
    if (!normalized.startsWith("migrations/") && !normalized.startsWith("seeds/")) {
      continue;
    }

    const targetPath = path.join(baseDir, normalized);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, content);
  }

  return {
    migrationsDir,
    seedsDir,
    cleanup: async () => {
      await fs.promises.rm(baseDir, { force: true, recursive: true });
    },
  };
}

/*
 * # マイグレーション Lambda ハンドラ
 *
 * ## 目的
 * scripts/migrate.ts（運用 CLI）から AWS Lambda invoke で起動される実行入口。S3 上の SQL アーカイブを展開し migration / seed を順に適用する。
 *
 * ## 説明
 * S3 上の SQL zip を /tmp 展開 → DSQL 接続生成 → migration → seed → cleanup の一連を実行。
 * 例外は pg エラー詳細含めて構造化ログに出した上で ok:false を返す（throw せず）。
 *
 * ## NOTE
 * - 失敗時も Lambda としては success レスポンス。呼び出し側（migrate.ts）が ok フィールドで判定する前提。
 */
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

  let artifactDirs: PreparedArtifactDirs | undefined;
  try {
    artifactDirs = await prepareArtifactDirs(requestId);
    const config = resolveMigrationConfigFromEnv(process.env);
    const result = await runDsqlMigrationAndSeed(config, {
      migrationsFolder: artifactDirs.migrationsDir,
      runMigration: event.migration?.enabled ?? true,
      runSeed: event.seed?.enabled ?? true,
      seedsFolder: artifactDirs.seedsDir,
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
  } finally {
    if (artifactDirs) {
      await artifactDirs.cleanup();
    }
  }
};
