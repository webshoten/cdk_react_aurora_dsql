import { spawnSync } from "node:child_process";
import { Command } from "commander";

type SharedOption = {
  sharedEnv: string;
  profile: string;
};

type SetCommandOptions = {
  key: string;
  value: string;
  secure: boolean;
} & SharedOption;

type ListCommandOptions = SharedOption;

const program = new Command().name("env").description("SSM Parameter Store の CD 入力値を操作する");

program
  .command("set")
  .description("CD 入力値を /pf/cd/<sharedEnv>/env/<key> に登録する")
  .requiredOption("-s, --shared <env>", "共有環境名（例: dev）")
  .requiredOption("-k, --key <key>", "キー名（例: ses/fromEmail）")
  .requiredOption("-v, --value <value>", "値")
  .option("--profile <name>", "AWS profile（既定: AWS_PROFILE → default）")
  .option("--secure", "SecureString として保存する")
  .action((raw) => {
    try {
      const opts = resolveSetOptions(raw);
      logResolved(opts);
      const parameterName = buildCdParameterName(opts.sharedEnv, opts.key);
      putParameter(opts.profile, parameterName, opts.value, opts.secure);
      console.log(`[env] set ${parameterName}`);
      console.log("[env:set] SUCCESS");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[env:set] failed: ${message}`);
      console.error("[env:set] FAILED");
      process.exit(1);
    }
  });

program
  .command("list")
  .description("CD 入力値を /pf/cd/<sharedEnv>/env/ 配下で一覧表示する")
  .requiredOption("-s, --shared <env>", "共有環境名（例: dev）")
  .option("--profile <name>", "AWS profile（既定: AWS_PROFILE → default）")
  .action((raw) => {
    try {
      const opts = resolveListOptions(raw);
      logResolved(opts);
      const prefix = buildCdPrefix(opts.sharedEnv);
      listParameters(opts.profile, prefix);
      console.log("[env:list] SUCCESS");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[env:list] failed: ${message}`);
      console.error("[env:list] FAILED");
      process.exit(1);
    }
  });

program.parse(process.argv);

function resolveSetOptions(raw: {
  shared?: string;
  profile?: string;
  key?: string;
  value?: string;
  secure?: boolean;
}): SetCommandOptions {
  const sharedEnv = required(raw.shared, "--shared");
  const key = sanitizeKey(required(raw.key, "--key"));
  const value = required(raw.value, "--value");
  return {
    sharedEnv,
    profile: resolveProfile(raw.profile),
    key,
    value,
    secure: Boolean(raw.secure),
  };
}

function resolveListOptions(raw: { shared?: string; profile?: string }): ListCommandOptions {
  return {
    sharedEnv: required(raw.shared, "--shared"),
    profile: resolveProfile(raw.profile),
  };
}

function resolveProfile(profile: string | undefined): string {
  return profile?.trim() || process.env.AWS_PROFILE || "default";
}

function buildCdPrefix(sharedEnv: string): string {
  return `/pf/cd/${sharedEnv}/env`;
}

function buildCdParameterName(sharedEnv: string, key: string): string {
  return `${buildCdPrefix(sharedEnv)}/${key}`;
}

function sanitizeKey(key: string): string {
  return key.replace(/^\/+/, "").replace(/\/+$/, "");
}

function required(value: string | undefined, optionName: string): string {
  const resolved = value?.trim();
  if (!resolved) {
    throw new Error(`${optionName} は必須です`);
  }
  return resolved;
}

function logResolved(opts: SharedOption): void {
  console.log(`[env] profile=${opts.profile} shared-env=${opts.sharedEnv}`);
}

function putParameter(profile: string, name: string, value: string, secure: boolean): void {
  const args = [
    "--profile",
    profile,
    "ssm",
    "put-parameter",
    "--name",
    name,
    "--value",
    value,
    "--type",
    secure ? "SecureString" : "String",
    "--overwrite",
  ];
  runAws(args, true);
}

function listParameters(profile: string, prefix: string): void {
  const args = [
    "--profile",
    profile,
    "ssm",
    "get-parameters-by-path",
    "--path",
    prefix,
    "--recursive",
    "--query",
    "Parameters[].{Name:Name,Type:Type,Version:Version,LastModifiedDate:LastModifiedDate}",
    "--output",
    "table",
  ];
  runAws(args, false);
}

function runAws(args: string[], containsSensitive: boolean): void {
  if (containsSensitive) {
    console.log("[exec] aws <sensitive-args-masked>");
  } else {
    console.log(`[exec] aws ${args.join(" ")}`);
  }
  const result = spawnSync("aws", args, { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
