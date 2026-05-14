import { createDsqlClientFromEnv, createUserRecord, findUserByUsername } from "@pf/core";
import { Command } from "commander";
import { logSuccess } from "./lib/log.ts";
import { logResolved, type RawOptions, resolveOptions } from "./lib/options.ts";
import { resolveUserCommandResources, runAwsCapture, withDbHint } from "./lib/user-command.ts";

type CreateUserRawOptions = RawOptions & {
  username?: string;
  password?: string;
  email?: string;
  medicalInstitutionId?: string;
};

const program = new Command()
  .name("create-user")
  .description("Cognito と users テーブルへ同一フローでユーザーを作成する")
  .requiredOption("-s, --shared <env>", "共有環境名（必須）")
  .requiredOption("--username <username>", "ユーザー名（必須）")
  .requiredOption("--password <password>", "パスワード（必須）")
  .requiredOption("--email <email>", "メールアドレス（必須）")
  .option(
    "--medical-institution-id <id>",
    "所属医療機関 ID（Cognito custom:institution_id と users.medical_institution_id に保存）",
  )
  .option("--stage <stage>", "ステージ名（既定: whoami）")
  .option("--profile <name>", "AWS profile（既定: AWS_PROFILE → default）");

program.parse(process.argv);
const raw = program.opts<CreateUserRawOptions>();
const opts = resolveOptions(raw);
logResolved(opts);

const username = required(raw.username, "--username");
const password = required(raw.password, "--password");
const email = required(raw.email, "--email");
const medicalInstitutionId = optionalMedicalInstitutionId(raw.medicalInstitutionId);

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[create-user] failed: ${message}`);
  console.error("[create-user] FAILED");
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

  const existing = await findUserByUsername(dbClient, username).catch((error: unknown) => {
    throw withDbHint(error);
  });
  if (existing) {
    throw new Error(`username '${username}' は既に登録済みです`);
  }

  let createdInIdentityProvider = false;
  try {
    runAwsCapture(
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
        ...cognitoInstitutionAttributes(medicalInstitutionId),
      ],
      false,
    );
    createdInIdentityProvider = true;

    runAwsCapture(
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

    const sub = runAwsCapture(
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
      medicalInstitutionId,
    }).catch((error: unknown) => {
      throw withDbHint(error);
    });

    console.log(`[create-user] created username=${username} uid=${sub}`);
    logSuccess();
  } catch (error: unknown) {
    if (createdInIdentityProvider) {
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
        console.error(`[create-user] rollback: deleted username=${username} from Cognito`);
      } catch (rollbackError: unknown) {
        const message =
          rollbackError instanceof Error ? rollbackError.message : String(rollbackError);
        console.error(`[create-user] rollback failed: ${message}`);
      }
    }

    throw error;
  }
}

function required(value: string | undefined, key: string): string {
  if (!value?.trim()) throw new Error(`${key} は必須です`);
  return value.trim();
}

function optionalMedicalInstitutionId(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  if (!trimmed) throw new Error("--medical-institution-id は空文字にできません");
  if (!/^[0-9]+$/.test(trimmed)) {
    throw new Error("--medical-institution-id は数値文字列のみ指定できます");
  }
  if (trimmed.length > 10) {
    throw new Error(
      "--medical-institution-id は Cognito custom:institution_id の上限に合わせて 10 文字以内です",
    );
  }
  return trimmed;
}

function cognitoInstitutionAttributes(medicalInstitutionId: string | undefined): string[] {
  if (!medicalInstitutionId) return [];
  return [`Name=custom:institution_id,Value=${medicalInstitutionId}`];
}
