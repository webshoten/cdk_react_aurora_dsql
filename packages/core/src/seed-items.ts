import type { DbClient } from "./db/types.ts";

export interface SeedItem {
  code: string;
  label: string;
}

/*
 * # デモシード一覧取得
 *
 * ## 目的
 * GraphQL リクエスト経由で demo_seed_items を一覧返却する。動作確認・初期表示用の最小読み出し。
 *
 * ## 説明
 * code 昇順でソート。DbClient スコープ内で 1 クエリ完結。
 */
export async function listSeedItems(dbClient: DbClient): Promise<SeedItem[]> {
  return dbClient(async (db) => {
    const result = await db.query<SeedItem>(
      "SELECT code, label FROM demo_seed_items ORDER BY code ASC",
    );
    return result.rows;
  });
}
