import { spawnSync } from "node:child_process";

/*
 * # 子プロセス同期実行ヘルパー
 *
 * ## 目的
 * scripts 配下から外部コマンド（pnpm、aws CLI 等）を起動する単一経路。失敗時の exit code 伝播と実行ログ出力を集約する。
 *
 * ## 説明
 * - spawnSync で stdio inherit。標準出力/エラーをそのまま親に流す。
 * - 実行前に `[exec] <cmd> <args...>` を console.log。実行されたコマンド再現が容易。
 * - 子プロセス非 0 終了時は同 exit code で process.exit。シェル使わないので引数のクォートエスケープ不要。
 */
export function run(cmd: string, args: string[]): void {
  console.log(`[exec] ${cmd} ${args.join(" ")}`);
  const result = spawnSync(cmd, args, { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
