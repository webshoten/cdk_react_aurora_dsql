import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import { createDsqlClientFromEnv, createUserRecord, findUserByUsername } from "../packages/core/src/index.ts";
import { Command } from "commander";
import { logResolved, type RawOptions, resolveOptions } from "./lib/options.ts";

type CreateUserRawOptions = RawOptions & {
  username?: string;
  password?: string;
  email?: string;
};

const program = new Command()
  .name("create-user")
  .description("Cognito と users テーブルへ同一フローでユーザーを作成する")
  .requiredOption("-s, --shared <env>", "共有環境名（必須）")
  .requiredOption("--username <username>", "ユーザー名（必須）")
  .requiredOption("--password <password>", "パスワード（必須）")
  .requiredOption("--email <email>", "メールアドレス（必須）")
  .option("--stage <stage>", "ステージ名（既定: whoami）")
  .option("--profile <name>", "AWS profile（既定: AWS_PROFILE → default）");

program.parse(process.argv);
const raw = program.opts<CreateUserRawOptions>();
const opts = resolveOptions(raw);
logResolved(opts);

const username = required(raw.username, "--username");
const password = required(raw.password, "--password");
const email = required(raw.email, "--email");

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[create-user] failed: ${message}`);
  process.exit(1);
});

async function main(): Promise<void> {
  const resources = resolveResources(opts.sharedEnv, opts.stage);
  const dbClient = createDsqlClientFromEnv({
    DSQL_DATABASE: "postgres",
    DSQL_DB_USER: "admin",
    DSQL_ENDPOINT: resources.dsqlEndpoint,
    DSQL_PORT: "5432",
    DSQL_REGION: resources.region,
  });

  const existing = await findUserByUsername(dbClient, username);
  if (existing) {
    throw new Error(`username '${username}' は既に登録済みです`);
  }

  let createdInIdentityProvider = false;
  try {
    runAws(
      opts.profile,
      [
        "cognito-idp",
        "admin-create-user",
        "--user-pool-id",
        resources.userPoolId,
        "--username",
        username,
        "--message-action",
        "SUPPRESS",
        "--user-attributes",
        `Name=email,Value=${email}`,
        "Name=email_verified,Value=true",
      ],
      false,
    );
    createdInIdentityProvider = true;

    runAws(
      opts.profile,
      [
        "cognito-idp",
        "admin-set-user-password",
        "--user-pool-id",
        resources.userPoolId,
        "--username",
        username,
        "--password",
        password,
        "--permanent",
      ],
      true,
    );

    const sub = runAws(
      opts.profile,
      [
        "cognito-idp",
        "admin-get-user",
        "--user-pool-id",
        resources.userPoolId,
        "--username",
        username,
        "--query",
        "UserAttributes[?Name=='sub'].Value | [0]",
        "--output",
        "text",
      ],
      false,
    );

    if (!sub) {
      throw new Error("Cognito user sub を取得できませんでした");
    }

    await createUserRecord(dbClient, {
      uid: sub,
      username,
      email,
      userType: "general",
    });

    console.log(`[create-user] created username=${username} uid=${sub}`);
  } catch (error: unknown) {
    if (createdInIdentityProvider) {
      try {
        runAws(
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
        console.error(`[create-user] rollback: deleted username=${username} from Cognito`);
      } catch (rollbackError: unknown) {
        const message = rollbackError instanceof Error ? rollbackError.message : String(rollbackError);
        console.error(`[create-user] rollback failed: ${message}`);
      }
    }

    throw error;
  }
}

function runAws(profile: string, args: string[], containsSensitive: boolean): string {
  if (containsSensitive) {
    console.log("[exec] aws <sensitive-args-masked>");
  } else {
    console.log(`[exec] aws --profile ${profile} ${args.join(" ")}`);
  }

  const result = spawnSync("aws", ["--profile", profile, ...args], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (result.status !== 0) {
    const stderr = (result.stderr ?? "").trim();
    throw new Error(stderr || "aws command failed");
  }

  return (result.stdout ?? "").trim();
}

function required(value: string | undefined, key: string): string {
  if (!value?.trim()) throw new Error(`${key} は必須です`);
  return value.trim();
}

function resolveResources(sharedEnv: string, stage: string): {
  dsqlEndpoint: string;
  region: string;
  userPoolId: string;
} {
  const outputsPath = "cdk-outputs.json";
  if (!fs.existsSync(outputsPath)) {
    throw new Error("cdk-outputs.json が見つかりません。先に cdk deploy を実行してください。");
  }

  const outputs = JSON.parse(fs.readFileSync(outputsPath, "utf8")) as Record<string, Record<string, string>>;

  const dbStack = outputs[`pf-${sharedEnv}-${stage}-db`];
  const authStack = outputs[`pf-${sharedEnv}-${stage}-auth`];

  const dsqlEndpoint = dbStack?.DsqlEndpoint;
  const userPoolId = authStack?.UserPoolId;
  const region = process.env.AWS_REGION || "ap-northeast-1";

  if (!dsqlEndpoint) {
    throw new Error(`cdk-outputs.json から pf-${sharedEnv}-${stage}-db.DsqlEndpoint を解決できません`);
  }
  if (!userPoolId) {
    throw new Error(`cdk-outputs.json から pf-${sharedEnv}-${stage}-auth.UserPoolId を解決できません`);
  }

  return {
    dsqlEndpoint,
    userPoolId,
    region,
  };
}
