import { run } from "./run.ts";

/**
 * Web (Vite) ビルド。BucketDeployment が web/dist を読むため deploy 前に必要。
 *
 * 実行されるコマンド:
 *   pnpm --filter @pf/web build
 *     → 内部で `tsc -b && vite build` が走り、packages/web/dist/ に成果物生成。
 */
export function buildWeb(): void {
  run("pnpm", ["--filter", "@pf/web", "build"]);
}
