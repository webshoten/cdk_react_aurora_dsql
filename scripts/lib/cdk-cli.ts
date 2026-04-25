import type { ResolvedOptions } from "./options.ts";
import { run } from "./run.ts";

export type CdkCommand = "deploy" | "diff" | "destroy";

export type CdkRunArgs = {
  /** "app" → AppStack 群、"shared" → SharedStack 群 */
  scope: "app" | "shared";
  command: CdkCommand;
  opts: ResolvedOptions;
  /** 追加 CDK 引数（-- の後ろ） */
  extra?: string[];
  /** outputs を JSON 出力するならパス */
  outputsFile?: string;
};

/**
 * @pf/infra の cdk CLI を pnpm 経由で起動する。
 * スタック名フィルタ・context・profile を組み立てる単一の入口。
 *
 * 実行されるコマンド例:
 *   App deploy:
 *     pnpm --filter @pf/infra cdk deploy "pf-dev-alice-*" \
 *       --profile my-aws \
 *       --context shared-env=dev \
 *       --context shared-only=false \
 *       --context stage=alice \
 *       --require-approval never \
 *       --outputs-file /<cwd>/cdk-outputs.json
 *
 *   Shared deploy:
 *     pnpm --filter @pf/infra cdk deploy "pf-dev-shared-*" \
 *       --profile my-aws \
 *       --context shared-env=dev \
 *       --context shared-only=true \
 *       --context stage=alice \
 *       --require-approval never \
 *       --outputs-file /<cwd>/cdk-outputs.json
 *
 *   App diff:
 *     pnpm --filter @pf/infra cdk diff "pf-dev-alice-*" \
 *       --profile my-aws --context ...
 *
 *   App destroy:
 *     pnpm --filter @pf/infra cdk destroy "pf-dev-alice-*" \
 *       --profile my-aws --context ... --force
 */
export function runCdk(args: CdkRunArgs): void {
  const { scope, command, opts, extra = [], outputsFile } = args;

  const stackFilter =
    scope === "shared" ? `pf-${opts.sharedEnv}-shared` : `pf-${opts.sharedEnv}-${opts.stage}-*`;

  const sharedOnly = scope === "shared" ? "true" : "false";

  const cliArgs: string[] = [
    "--filter",
    "@pf/infra",
    "cdk",
    command,
    stackFilter,
    "--profile",
    opts.profile,
    "--context",
    `shared-env=${opts.sharedEnv}`,
    "--context",
    `shared-only=${sharedOnly}`,
    "--context",
    `stage=${opts.stage}`,
  ];

  if (command === "deploy") {
    cliArgs.push("--require-approval", "never");
  }
  if (command === "destroy") {
    cliArgs.push("--force");
  }
  if (outputsFile) {
    cliArgs.push("--outputs-file", outputsFile);
  }
  cliArgs.push(...extra);

  run("pnpm", cliArgs);
}
