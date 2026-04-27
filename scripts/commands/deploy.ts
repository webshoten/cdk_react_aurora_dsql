import * as path from "node:path";
import { runCdk } from "../lib/cdk-cli.ts";
import { logResolved, type RawOptions, resolveOptions } from "../lib/options.ts";
import { buildWeb } from "../lib/web-build.ts";

/*
 * # AppStack デプロイ CLI コマンド
 *
 * ## 目的
 * scripts/cdk.ts の `deploy` サブコマンド実体。Web ビルド → AppStack（db + api + ops + web）デプロイを 1 コマンドで完結させる。
 *
 * ## 説明
 * 1. buildWeb で packages/web を build → dist 生成。
 * 2. runCdk で `pf-<sharedEnv>-<stage>-*` 全 AppStack を `cdk deploy`。
 * 3. cdk-outputs.json をリポジトリ ルートに書き出し、scripts/migrate.ts 等の運用 CLI から参照させる。
 *
 * 呼び出し例:
 *   pnpm cdk:deploy --shared dev --profile my-aws
 *     → 内部で:
 *        pnpm --filter @pf/web build
 *        pnpm --filter @pf/infra cdk deploy "pf-dev-<whoami>-*" \
 *          --profile my-aws --context shared-env=dev --context shared-only=false \
 *          --context stage=<whoami> --require-approval never \
 *          --outputs-file <cwd>/cdk-outputs.json
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
