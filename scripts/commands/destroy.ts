import { runCdk } from "../lib/cdk-cli.ts";
import { logResolved, type RawOptions, resolveOptions } from "../lib/options.ts";

/**
 * AppStack 群を破棄（--force）。
 *
 * 呼び出し例:
 *   pnpm cdk:destroy --shared dev --stage alice --profile my-aws
 *     → 内部で:
 *        pnpm --filter @pf/infra cdk destroy "pf-dev-alice-*" \
 *          --profile my-aws --context shared-env=dev --context shared-only=false \
 *          --context stage=alice --force
 *
 *   対象スタック例: pf-dev-alice-api, pf-dev-alice-web
 */
export function destroy(raw: RawOptions, extra: string[]): void {
  const opts = resolveOptions(raw);
  logResolved(opts);

  runCdk({ scope: "app", command: "destroy", opts, extra });
}
