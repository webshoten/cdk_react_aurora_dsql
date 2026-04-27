import { randomUUID } from "node:crypto";
import { asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { images } from "../db/schema.ts";
import type { DbClient } from "../db/types.ts";
import type { ImageRecord, RegisterImageInput } from "./types.ts";

/*
 * # 画像一覧取得
 *
 * ## 目的
 * 11-2.data-02 の一覧表示で利用する画像メタデータを返す。
 */
export async function listImages(dbClient: DbClient): Promise<ImageRecord[]> {
  return dbClient(async (db) => {
    const drizzleDb = drizzle(db);

    return drizzleDb
      .select({
        imageId: images.imageId,
        imagePath: images.imagePath,
        fileName: images.fileName,
        contentType: images.contentType,
        sizeBytes: images.sizeBytes,
      })
      .from(images)
      .orderBy(asc(images.imagePath));
  });
}

/*
 * # 画像登録（idempotent）
 *
 * ## 目的
 * S3 に保存済み画像のメタデータを DB に登録する。
 *
 * ## 説明
 * image_path を unique key とし、同一パスの重複登録は無視する。
 */
export async function registerImage(
  dbClient: DbClient,
  input: RegisterImageInput,
): Promise<number> {
  return dbClient(async (db) => {
    const drizzleDb = drizzle(db);

    const inserted = await drizzleDb
      .insert(images)
      .values({
        imageId: randomUUID(),
        imagePath: input.imagePath,
        fileName: input.fileName,
        contentType: input.contentType,
        sizeBytes: input.sizeBytes,
      })
      .onConflictDoNothing({
        target: images.imagePath,
      })
      .returning({ imageId: images.imageId });

    return inserted.length;
  });
}
