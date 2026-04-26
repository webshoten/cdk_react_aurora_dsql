import * as fs from "node:fs";
import * as path from "node:path";
import { Command } from "commander";
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
const functionName = resolveFunctionName(stackName);

const payload = {
  migration: { enabled: !raw.seedOnly },
  requestId: `manual-${Date.now()}`,
  seed: { enabled: !raw.migrationOnly },
  sharedEnv: opts.sharedEnv,
  stage: opts.stage,
};

const outputFile = path.resolve(process.cwd(), ".migration-runner-output.json");

run("aws", [
  "lambda",
  "invoke",
  "--profile",
  opts.profile,
  "--function-name",
  functionName,
  "--cli-binary-format",
  "raw-in-base64-out",
  "--payload",
  JSON.stringify(payload),
  outputFile,
]);

const output = fs.readFileSync(outputFile, "utf8");
console.log(`[migration-runner] output: ${output}`);

function resolveFunctionName(stackName: string): string {
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
  const functionName = outputs[stackName]?.MigrationRunnerFunctionName;

  if (!functionName) {
    throw new Error(
      `${outputsPath} から ${stackName}.MigrationRunnerFunctionName を解決できませんでした。`,
    );
  }

  return functionName;
}
