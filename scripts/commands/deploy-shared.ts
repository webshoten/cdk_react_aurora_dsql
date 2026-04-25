import * as path from "node:path";
import { runCdk } from "../lib/cdk-cli.ts";
import { logResolved, type RawOptions, resolveOptions } from "../lib/options.ts";

/**
 * SharedStack 群（将来の共有基盤受け口）をデプロイ。
 *
 * 呼び出し例:
 *   pnpm cdk:deploy:shared --shared dev --profile my-aws
 *     → 内部で:
 *        pnpm --filter @pf/infra cdk deploy "pf-dev-shared-*" \
 *          --profile my-aws --context shared-env=dev --context shared-only=true \
 *          --context stage=<whoami> --require-approval never \
 *          --outputs-file <cwd>/cdk-outputs.json
 *
 *   対象スタック例: pf-dev-shared
 */
export function deployShared(raw: RawOptions, extra: string[]): void {
  const opts = resolveOptions(raw);
  logResolved(opts);

  runCdk({
    scope: "shared",
    command: "deploy",
    opts,
    extra,
    outputsFile: path.resolve(process.cwd(), "cdk-outputs.json"),
  });
}
