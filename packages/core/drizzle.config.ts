import { defineConfig } from "drizzle-kit";

/*
 * # Drizzle Kit 設定
 *
 * ## 目的
 * pnpm drizzle-kit generate でスキーマ差分から SQL マイグレーションファイルを生成する設定。
 *
 * ## 説明
 * out はソースツリー内（src/db/migrations）。実行時は別経路（マイグレーション Lambda が S3 上の SQL zip を展開）で配布。
 */
export default defineConfig({
  dialect: "postgresql",
  out: "./src/db/migrations",
  schema: "./src/db/schema.ts",
});
