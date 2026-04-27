import { runCdk } from "../lib/cdk-cli.ts";
import { logResolved, type RawOptions, resolveOptions } from "../lib/options.ts";

/*
 * # SharedStack 破棄 CLI コマンド
 *
 * ## 目的
 * scripts/cdk.ts の `destroy-shared` サブコマンド実体。共有層 Stack を `cdk destroy --force` で破棄する。
 *
 * ## 説明
 * SharedStack には SSM パラメータ等、AppStack が参照する共有契約値が含まれる。AppStack を残したまま破棄すると参照解決失敗で破綻するため、AppStack を先に destroy 済みであることが前提。
 *
 * 呼び出し例:
 *   pnpm cdk:destroy:shared --shared dev --profile my-aws
 *     → 内部で:
 *        pnpm --filter @pf/infra cdk destroy "pf-dev-shared-*" \
 *          --profile my-aws --context shared-env=dev --context shared-only=true \
 *          --context stage=<whoami> --force
 */
export function destroyShared(raw: RawOptions, extra: string[]): void {
  const opts = resolveOptions(raw);
  logResolved(opts);

  runCdk({ scope: "shared", command: "destroy", opts, extra });
}
