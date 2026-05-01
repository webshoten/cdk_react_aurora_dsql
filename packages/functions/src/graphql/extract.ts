import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { lexicographicSortSchema, printSchema } from "graphql";
import { schema } from "./schema/index.ts";

/*
 * ## 目的
 * 実行中の GraphQL schema を SDL ファイルへ出力する。
 *
 * ## 説明
 * ソート済み schema を `packages/graphql/schema.graphql` へ書き出す。
 */
async function extractSchema() {
  const schemaAsString = printSchema(lexicographicSortSchema(schema));
  const outputPath = path.resolve(process.cwd(), "..", "graphql", "schema.graphql");

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${schemaAsString}\n`, "utf8");

  console.log(`GraphQL schema extracted: ${outputPath}`);
}

void extractSchema();
