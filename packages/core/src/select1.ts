import type { DbClient } from "./db/types.ts";

export async function select1(dbClient: DbClient): Promise<number | null> {
  return dbClient(async (db) => {
    const result = await db.query<{ value: number }>("SELECT 1 AS value");
    return Number(result.rows[0]?.value ?? null);
  });
}
