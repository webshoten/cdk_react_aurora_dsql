import * as path from "node:path";
import { runCdk } from "../lib/cdk-cli.ts";
import { logResolved, type RawOptions, resolveOptions } from "../lib/options.ts";
import { buildWeb } from "../lib/web-build.ts";

/**
 * AppStack（api + web）デプロイ。
 *   1. web をビルド（dist 生成）
 *   2. cdk deploy で api → web 解決
 *
 * 呼び出し例:
 *   pnpm cdk:deploy --shared dev --profile my-aws
 *     → 内部で:
 *        pnpm --filter @pf/web build
 *        pnpm --filter @pf/infra cdk deploy "pf-dev-<whoami>-*" \
 *          --profile my-aws --context shared-env=dev --context shared-only=false \
 *          --context stage=<whoami> --require-approval never \
 *          --outputs-file <cwd>/cdk-outputs.json
 *
 *   対象スタック例: pf-dev-<whoami>-api, pf-dev-<whoami>-web
 */
export function deploy(raw: RawOptions, extra: string[]): void {
  const opts = resolveOptions(raw);
  logResolved(opts);

  buildWeb();

  runCdk({
    scope: "app",
    command: "deploy",
    opts,
    extra,
    outputsFile: path.resolve(process.cwd(), "cdk-outputs.json"),
  });
}
