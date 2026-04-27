import { runCdk } from "../lib/cdk-cli.ts";
import { logResolved, type RawOptions, resolveOptions } from "../lib/options.ts";

/*
 * # AppStack 破棄 CLI コマンド
 *
 * ## 目的
 * scripts/cdk.ts の `destroy` サブコマンド実体。AppStack 群（db / api / ops / web）を `cdk destroy --force` で一括破棄する。
 *
 * ## 説明
 * 対象は `pf-<sharedEnv>-<stage>-*`。SharedStack は対象外（destroy-shared を別途使う）。
 *
 * 呼び出し例:
 *   pnpm cdk:destroy --shared dev --stage alice --profile my-aws
 *     → 内部で:
 *        pnpm --filter @pf/infra cdk destroy "pf-dev-alice-*" \
 *          --profile my-aws --context shared-env=dev --context shared-only=false \
 *          --context stage=alice --force
 */
export function destroy(raw: RawOptions, extra: string[]): void {
  const opts = resolveOptions(raw);
  logResolved(opts);

  runCdk({ scope: "app", command: "destroy", opts, extra });
}
