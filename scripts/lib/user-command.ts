import { spawnSync } from "node:child_process";
import * as fs from "node:fs";

export type UserCommandResources = {
  dsqlEndpoint: string;
  region: string;
  userPoolId: string;
};

/*
 * # ユーザー運用 CLI リソース解決
 *
 * ## 目的
 * ユーザー作成・削除など、Cognito と users テーブルを同時に扱う CLI の環境解決を揃える。
 *
 * ## 説明
 * デプロイ済み stack outputs を読み、Auth と DB の接続先を同じ規則で取り出す。
 */
export function resolveUserCommandResources(
  sharedEnv: string,
  stage: string,
): UserCommandResources {
  const outputsPath = "cdk-outputs.json";
  if (!fs.existsSync(outputsPath)) {
    throw new Error("cdk-outputs.json が見つかりません。先に cdk deploy を実行してください。");
  }

  const outputs = JSON.parse(fs.readFileSync(outputsPath, "utf8")) as Record<
    string,
    Record<string, string>
  >;

  const dbStack = outputs[`pf-${sharedEnv}-${stage}-db`];
  const authStack = outputs[`pf-${sharedEnv}-${stage}-auth`];

  const dsqlEndpoint = dbStack?.DsqlEndpoint;
  const userPoolId = authStack?.UserPoolId;
  const region = process.env.AWS_REGION || "ap-northeast-1";

  if (!dsqlEndpoint) {
    throw new Error(
      `cdk-outputs.json から pf-${sharedEnv}-${stage}-db.DsqlEndpoint を解決できません`,
    );
  }
  if (!userPoolId) {
    throw new Error(
      `cdk-outputs.json から pf-${sharedEnv}-${stage}-auth.UserPoolId を解決できません`,
    );
  }

  return {
    dsqlEndpoint,
    userPoolId,
    region,
  };
}

/*
 * # AWS CLI 実行
 *
 * ## 目的
 * ユーザー運用 CLI から AWS CLI を実行し、標準出力を呼び出し側で利用できる形にする。
 *
 * ## 説明
 * password などを含む可能性があるコマンドは、実行ログで引数をマスクする。
 */
export function runAwsCapture(profile: string, args: string[], containsSensitive: boolean): string {
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

/*
 * # DB エラー補助
 *
 * ## 目的
 * ユーザー運用 CLI の DB 失敗時に、migration 未適用などの調査起点を表示する。
 */
export function withDbHint(error: unknown): Error {
  const message = error instanceof Error ? error.message : String(error);
  const lower = message.toLowerCase();

  if (lower.includes("column") && lower.includes("does not exist")) {
    return new Error(
      [
        message,
        "hint: users テーブル列不足の可能性があります（migration 未適用を確認してください）。",
      ].join("\n"),
    );
  }

  if (lower.includes("relation") && lower.includes("does not exist")) {
    return new Error(
      [
        message,
        "hint: users テーブル未作成の可能性があります（migration 状態を確認してください）。",
      ].join("\n"),
    );
  }

  return error instanceof Error ? error : new Error(String(error));
}

/*
 * # Cognito ユーザー不存在判定
 *
 * ## 目的
 * 削除系 CLI で、Cognito 側に対象がない場合だけ DB 削除を継続できるようにする。
 */
export function isCognitoUserNotFoundError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("UserNotFoundException") || message.includes("User does not exist");
}
