import { runCdk } from "../lib/cdk-cli.ts";
import { logResolved, type RawOptions, resolveOptions } from "../lib/options.ts";

/**
 * SharedStack 群を破棄（--force）。
 *
 * 呼び出し例:
 *   pnpm cdk:destroy:shared --shared dev --profile my-aws
 *     → 内部で:
 *        pnpm --filter @pf/infra cdk destroy "pf-dev-shared-*" \
 *          --profile my-aws --context shared-env=dev --context shared-only=true \
 *          --context stage=<whoami> --force
 *
 *   対象スタック例: pf-dev-shared
 */
export function destroyShared(raw: RawOptions, extra: string[]): void {
  const opts = resolveOptions(raw);
  logResolved(opts);

  runCdk({ scope: "shared", command: "destroy", opts, extra });
}
