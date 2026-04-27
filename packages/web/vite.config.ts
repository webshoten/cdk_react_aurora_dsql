import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

/*
 * # Vite 設定（Web パッケージ）
 *
 * ## 目的
 * web パッケージのビルド・開発サーバー設定。pnpm dev / build から呼ばれる。
 *
 * ## 説明
 * - "@" alias を src/ に貼る。`@/app/...` `@/shared/...` 形式の絶対インポートが全コードで前提。
 * - 開発サーバー 5173 番。infra 側 BucketDeployment が dist を取り込むため、outDir はリポジトリ既定の "dist" を維持する必要あり。
 * - sourcemap 有効。CloudFront 配信物にも .map が含まれる点に注意。
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
