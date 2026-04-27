import { runCdk } from "../lib/cdk-cli.ts";
import { logResolved, type RawOptions, resolveOptions } from "../lib/options.ts";

/*
 * # AppStack 差分表示 CLI コマンド
 *
 * ## 目的
 * scripts/cdk.ts の `diff` サブコマンド実体。AppStack 群（db / api / ops / web）の `cdk diff` を実行する。
 *
 * 呼び出し例:
 *   pnpm cdk:diff --shared dev --stage alice --profile my-aws
 *     → 内部で:
 *        pnpm --filter @pf/infra cdk diff "pf-dev-alice-*" \
 *          --profile my-aws --context shared-env=dev --context shared-only=false \
 *          --context stage=alice
 */
export function diff(raw: RawOptions, extra: string[]): void {
  const opts = resolveOptions(raw);
  logResolved(opts);

  runCdk({ scope: "app", command: "diff", opts, extra });
}
