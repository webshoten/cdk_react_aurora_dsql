import { runCdk } from "../lib/cdk-cli.ts";
import { logResolved, type RawOptions, resolveOptions } from "../lib/options.ts";

/**
 * AppStack 群の差分表示。
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
