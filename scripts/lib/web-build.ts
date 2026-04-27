import { run } from "./run.ts";

/*
 * # Web ビルド実行
 *
 * ## 目的
 * deploy フローの前段で必ず呼ばれるエントリ。WebStack の BucketDeployment が packages/web/dist を読むため、deploy 直前に最新ビルドを生成する。
 *
 * ## 説明
 * `pnpm --filter @pf/web build` を起動。内部で `tsc -b && vite build` が走り packages/web/dist/ に成果物生成。
 */
export function buildWeb(): void {
  run("pnpm", ["--filter", "@pf/web", "build"]);
}
