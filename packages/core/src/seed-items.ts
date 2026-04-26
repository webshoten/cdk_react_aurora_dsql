import type { DbClient } from "./db/types.ts";

export interface SeedItem {
  code: string;
  label: string;
}

export async function listSeedItems(dbClient: DbClient): Promise<SeedItem[]> {
  return dbClient(async (db) => {
    const result = await db.query<SeedItem>(
      "SELECT code, label FROM demo_seed_items ORDER BY code ASC",
    );
    return result.rows;
  });
}
