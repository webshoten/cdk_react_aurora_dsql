import { createDsqlClientFromEnv, deleteUserRecordByUsername } from "@pf/core";
import { Command } from "commander";
import { logSuccess } from "./lib/log.ts";
import { logResolved, type RawOptions, resolveOptions } from "./lib/options.ts";
import {
  isCognitoUserNotFoundError,
  resolveUserCommandResources,
  runAwsCapture,
  withDbHint,
} from "./lib/user-command.ts";

type DeleteUserRawOptions = RawOptions & {
  username?: string;
};

const program = new Command()
  .name("delete-user")
  .description("Cognito と users テーブルから同一フローでユーザーを削除する")
  .requiredOption("-s, --shared <env>", "共有環境名（必須）")
  .requiredOption("--username <username>", "ユーザー名（必須）")
  .option("--stage <stage>", "ステージ名（既定: whoami）")
  .option("--profile <name>", "AWS profile（既定: AWS_PROFILE → default）");

program.parse(process.argv);
const raw = program.opts<DeleteUserRawOptions>();
const opts = resolveOptions(raw);
logResolved(opts);

const username = required(raw.username, "--username");

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[delete-user] failed: ${message}`);
  console.error("[delete-user] FAILED");
  process.exit(1);
});

async function main(): Promise<void> {
  const resources = resolveUserCommandResources(opts.sharedEnv, opts.stage);
  const dbClient = createDsqlClientFromEnv({
    AWS_REGION: resources.region,
    DSQL_DATABASE: "postgres",
    DSQL_DB_USER: "admin",
    DSQL_ENDPOINT: resources.dsqlEndpoint,
    DSQL_PORT: "5432",
  });

  let cognitoDeleted = false;
  try {
    runAwsCapture(
      opts.profile,
      [
        "cognito-idp",
        "admin-delete-user",
        "--user-pool-id",
        resources.userPoolId,
        "--username",
        username,
      ],
      false,
    );
    cognitoDeleted = true;
  } catch (error: unknown) {
    if (!isCognitoUserNotFoundError(error)) {
      throw error;
    }
    console.warn(`[delete-user] warning: Cognito user not found username=${username}`);
  }

  const dbDeleted = await deleteUserRecordByUsername(dbClient, username).catch((error: unknown) => {
    throw withDbHint(error);
  });

  console.log(
    `[delete-user] deleted username=${username} cognito=${cognitoDeleted ? "deleted" : "not-found"} db=${
      dbDeleted ? "deleted" : "not-found"
    }`,
  );
  logSuccess();
}

function required(value: string | undefined, key: string): string {
  if (!value?.trim()) throw new Error(`${key} は必須です`);
  return value.trim();
}
