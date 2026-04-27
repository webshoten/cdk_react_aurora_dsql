import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { lexicographicSortSchema, printSchema } from "graphql";
import { schema } from "./schema.ts";

async function extractSchema() {
  const schemaAsString = printSchema(lexicographicSortSchema(schema));
  const outputPath = path.resolve(process.cwd(), "..", "graphql", "schema.graphql");

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${schemaAsString}\n`, "utf8");

  console.log(`GraphQL schema extracted: ${outputPath}`);
}

void extractSchema();
