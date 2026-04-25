import { spawnSync } from "node:child_process";

/**
 * 子プロセス同期実行。失敗時はそのまま exit code 伝播して終了する。
 * stdout/stderr はそのまま親に流す（inherit）。
 *
 * 実行例（呼び出し側次第）:
 *   run("pnpm", ["--filter", "@pf/web", "build"])
 *     → pnpm --filter @pf/web build
 *
 *   run("pnpm", ["--filter", "@pf/infra", "cdk", "deploy", "..."])
 *     → pnpm --filter @pf/infra cdk deploy ...
 *
 * 実行前に [exec] <cmd> <args...> を console.log で出すので、ログを見れば
 * 実際に走ったコマンドが分かる。
 */
export function run(cmd: string, args: string[]): void {
  console.log(`[exec] ${cmd} ${args.join(" ")}`);
  const result = spawnSync(cmd, args, { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
