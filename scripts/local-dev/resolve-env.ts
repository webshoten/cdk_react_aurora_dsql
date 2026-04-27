import * as fs from "node:fs";
import * as path from "node:path";
import { Command } from "commander";
import { logResolved, type RawOptions, resolveOptions } from "../lib/options.ts";

const program = new Command()
  .name("local-dev:resolve-env")
  .description("cdk-outputs.json から local-dev 向け envFile を生成する")
  .requiredOption("-s, --shared <env>", "共有環境名（必須）")
  .option("--stage <stage>", "ステージ名（既定: whoami）")
  .option("--profile <name>", "AWS profile（既定: AWS_PROFILE → default）");

program.parse(process.argv);
const raw = program.opts<RawOptions>();
const opts = resolveOptions(raw);
logResolved(opts);

const stackName = `pf-${opts.sharedEnv}-${opts.stage}-db`;
const outputsPath = path.resolve(process.cwd(), "cdk-outputs.json");

if (!fs.existsSync(outputsPath)) {
  throw new Error("cdk-outputs.json が見つかりません。先に cdk deploy を実行してください。");
}

const outputs = JSON.parse(fs.readFileSync(outputsPath, "utf8")) as Record<string, Record<string, string>>;
const stackOutputs = outputs[stackName];
if (!stackOutputs) {
  throw new Error(`${outputsPath} に ${stackName} の出力がありません。`);
}

const endpoint = stackOutputs.DsqlEndpoint;
const clusterArn = stackOutputs.DsqlClusterArn;

if (!endpoint || !clusterArn) {
  throw new Error(`${stackName} の DsqlEndpoint / DsqlClusterArn を解決できませんでした。`);
}

const envFilePath = path.resolve(process.cwd(), ".vscode/.local-dev.env");
fs.mkdirSync(path.dirname(envFilePath), { recursive: true });
fs.writeFileSync(
  envFilePath,
  [
    `AWS_PROFILE=${opts.profile}`,
    `DSQL_ENDPOINT=${endpoint}`,
    `DSQL_CLUSTER_ARN=${clusterArn}`,
    `SHARED_ENV=${opts.sharedEnv}`,
    `STAGE=${opts.stage}`,
    "",
  ].join("\n"),
);

console.log(`[local-dev] wrote ${envFilePath}`);

const webConfigPath = path.resolve(process.cwd(), "packages/web/public/config.js");
fs.mkdirSync(path.dirname(webConfigPath), { recursive: true });
fs.writeFileSync(
  webConfigPath,
  `window.__CONFIG__=${JSON.stringify({ apiUrl: "http://localhost:4000" })};\n`,
);

console.log(`[local-dev] wrote ${webConfigPath}`);
