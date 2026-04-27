/*
 * # マイグレーション CLI（運用ツール）
 *
 * ## 目的
 * デプロイ済み環境に対し migration / seed を適用する運用 CLI。手動運用での DB スキーマ更新・デモデータ投入に使う。
 *
 * ## 説明
 * 1. packages/core/src/db/migrations と seeds を zip 化（.migration-sql.zip）
 * 2. cdk-outputs.json から S3 バケット名・オブジェクトキー・関数名を解決
 * 3. aws s3 cp で zip をアップロード
 * 4. aws lambda invoke で MigrationRunner を実行し、結果を .migration-runner-output.json に取得
 *
 * 呼び出し例:
 *   pnpm migrate --shared dev
 *   pnpm migrate --shared dev --stage alice --migration-only
 *   pnpm migrate --shared dev --seed-only
 *
 * ## NOTE
 * - 実行には事前に対象 stage のデプロイ完了（cdk-outputs.json 更新済み）が必要。
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { Command } from "commander";
import { zipSync } from "fflate";
import { logResolved, type RawOptions, resolveOptions } from "./lib/options.ts";
import { run } from "./lib/run.ts";

type MigrateRawOptions = RawOptions & {
  migrationOnly?: boolean;
  seedOnly?: boolean;
};

const program = new Command()
  .name("migrate")
  .description("MigrationRunner Lambda を invoke して migration/seed を適用する")
  .requiredOption("-s, --shared <env>", "共有環境名（必須）")
  .option("--stage <stage>", "ステージ名（既定: whoami）")
  .option("--profile <name>", "AWS profile（既定: AWS_PROFILE → default）")
  .option("--migration-only", "migration のみ実行")
  .option("--seed-only", "seed のみ実行");

program.parse(process.argv);
const raw = program.opts<MigrateRawOptions>();

if (raw.migrationOnly && raw.seedOnly) {
  throw new Error("--migration-only と --seed-only は同時指定できません");
}

const opts = resolveOptions(raw);
logResolved(opts);

const stackName = `pf-${opts.sharedEnv}-${opts.stage}-ops`;
const resource = resolveMigrationResource(stackName);

const payload = {
  migration: { enabled: !raw.seedOnly },
  requestId: `manual-${Date.now()}`,
  seed: { enabled: !raw.migrationOnly },
  sharedEnv: opts.sharedEnv,
  stage: opts.stage,
};

const archiveFile = path.resolve(process.cwd(), ".migration-sql.zip");
const outputFile = path.resolve(process.cwd(), ".migration-runner-output.json");

buildMigrationArtifactArchive(archiveFile);
run("aws", [
  "s3",
  "cp",
  "--profile",
  opts.profile,
  archiveFile,
  `s3://${resource.artifactBucketName}/${resource.artifactObjectKey}`,
]);

run("aws", [
  "lambda",
  "invoke",
  "--profile",
  opts.profile,
  "--function-name",
  resource.functionName,
  "--cli-binary-format",
  "raw-in-base64-out",
  "--payload",
  JSON.stringify(payload),
  outputFile,
]);

const output = fs.readFileSync(outputFile, "utf8");
console.log(`[migration-runner] output: ${output}`);

/*
 * # CFN outputs から MigrationRunner リソース解決
 *
 * ## 目的
 * cdk-outputs.json を読み、対象 stage の Ops Stack 出力（バケット名・オブジェクトキー・関数名）を取り出す。
 *
 * ## 説明
 * outputs ファイル不存在・必須キー欠落は早期に throw（実行不能のため）。
 */
function resolveMigrationResource(stackName: string): {
  artifactBucketName: string;
  artifactObjectKey: string;
  functionName: string;
} {
  const outputsPath = path.resolve(process.cwd(), "cdk-outputs.json");
  if (!fs.existsSync(outputsPath)) {
    throw new Error(
      "cdk-outputs.json が見つかりません。先に deploy を実行するか、ファイルを用意してください。",
    );
  }

  const outputs = JSON.parse(fs.readFileSync(outputsPath, "utf8")) as Record<
    string,
    Record<string, string>
  >;
  const stackOutputs = outputs[stackName];
  const functionName = stackOutputs?.MigrationRunnerFunctionName;
  const artifactBucketName = stackOutputs?.MigrationArtifactBucketName;
  const artifactObjectKey = stackOutputs?.MigrationArtifactObjectKey;

  if (!functionName || !artifactBucketName || !artifactObjectKey) {
    throw new Error(
      `${outputsPath} から ${stackName}.MigrationRunnerFunctionName/MigrationArtifactBucketName/MigrationArtifactObjectKey を解決できませんでした。`,
    );
  }

  return {
    artifactBucketName,
    artifactObjectKey,
    functionName,
  };
}

/*
 * # Migration / Seed SQL zip 生成
 *
 * ## 目的
 * 実行に先立ち migrations/ と seeds/ の .sql ファイルを 1 zip にまとめてローカル出力する。
 *
 * ## 説明
 * 各ディレクトリ直下の .sql のみ採取（再帰なし）。zip 内パスは `migrations/<file>` `seeds/<file>` に正規化。Lambda 側 `normalizeArtifactPath`（識別子名）が想定する形式と整合。
 */
function buildMigrationArtifactArchive(outputPath: string): void {
  const files: Record<string, Uint8Array> = {};
  const migrationsDir = path.resolve(process.cwd(), "packages/core/src/db/migrations");
  const seedsDir = path.resolve(process.cwd(), "packages/core/src/db/seeds");

  for (const sqlFileName of listTopLevelSqlFiles(migrationsDir)) {
    const absolutePath = path.join(migrationsDir, sqlFileName);
    files[`migrations/${sqlFileName}`] = fs.readFileSync(absolutePath);
  }

  for (const sqlFileName of listTopLevelSqlFiles(seedsDir)) {
    const absolutePath = path.join(seedsDir, sqlFileName);
    files[`seeds/${sqlFileName}`] = fs.readFileSync(absolutePath);
  }

  fs.writeFileSync(outputPath, Buffer.from(zipSync(files)));
}

function listTopLevelSqlFiles(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".sql"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}
