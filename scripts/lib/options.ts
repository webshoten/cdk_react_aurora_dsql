import * as os from "node:os";

/**
 * 全 cdk サブコマンド共通の生オプション（commander から渡る形）
 */
export type RawOptions = {
  shared?: string;
  stage?: string;
  profile?: string;
};

/**
 * 解決済みオプション（default 適用済み）
 */
export type ResolvedOptions = {
  sharedEnv: string;
  stage: string;
  profile: string;
};

/**
 * 解決ルール:
 *   sharedEnv: --shared 必須
 *   stage    : --stage > whoami
 *   profile  : --profile > AWS_PROFILE > "default"
 *
 * 例:
 *   `tsx scripts/cdk.ts deploy --shared dev --stage alice --profile my-aws`
 *     → { sharedEnv: "dev", stage: "alice", profile: "my-aws" }
 *
 *   `AWS_PROFILE=foo tsx scripts/cdk.ts deploy --shared dev`
 *     → { sharedEnv: "dev", stage: <whoami>, profile: "foo" }
 *
 *   `tsx scripts/cdk.ts deploy --shared dev`
 *     → { sharedEnv: "dev", stage: <whoami>, profile: "default" }
 */
export function resolveOptions(raw: RawOptions): ResolvedOptions {
  if (!raw.shared) {
    throw new Error("--shared <env> 必須（例: --shared dev）");
  }
  return {
    sharedEnv: raw.shared,
    stage: raw.stage ?? os.userInfo().username,
    profile: raw.profile ?? process.env.AWS_PROFILE ?? "default",
  };
}

export function logResolved(opts: ResolvedOptions): void {
  console.log(`[cdk] profile=${opts.profile} shared-env=${opts.sharedEnv} stage=${opts.stage}`);
}
