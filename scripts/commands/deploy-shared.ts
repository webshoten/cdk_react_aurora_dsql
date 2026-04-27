import * as path from "node:path";
import { runCdk } from "../lib/cdk-cli.ts";
import { logResolved, type RawOptions, resolveOptions } from "../lib/options.ts";

/*
 * # SharedStack デプロイ CLI コマンド
 *
 * ## 目的
 * scripts/cdk.ts の `deploy-shared` サブコマンド実体。共有層（SharedStack）のみを単独デプロイする。
 *
 * ## 説明
 * AppStack より先に SharedStack を立てておく必要があるユースケース（環境立ち上げ初回・共有契約バージョン更新）で利用。
 *
 * 呼び出し例:
 *   pnpm cdk:deploy:shared --shared dev --profile my-aws
 *     → 内部で:
 *        pnpm --filter @pf/infra cdk deploy "pf-dev-shared-*" \
 *          --profile my-aws --context shared-env=dev --context shared-only=true \
 *          --context stage=<whoami> --require-approval never \
 *          --outputs-file <cwd>/cdk-outputs.json
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
