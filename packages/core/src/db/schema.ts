import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/*
 * # medical_staffs テーブル
 *
 * ## 目的
 * 医療機関ごとの所属スタッフを保持するドメイン主テーブル。GraphQL 経路の参照／登録両方が利用。
 *
 * ## 説明
 * staff_code が PK。institution_code で医療機関単位の絞り込みクエリを想定。
 */
export const medicalStaffs = pgTable("medical_staffs", {
  staffCode: text("staff_code").primaryKey(),
  institutionCode: text("institution_code").notNull(),
  name: text("name").notNull(),
  profession: text("profession").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/*
 * # demo_seed_items テーブル
 *
 * ## 目的
 * セットアップ確認用のデモシード投入先。動作検証・初期表示確認に使う。
 *
 * ## NOTE
 * - 本番ドメインデータではない。スキーマ整理時は削除候補。
 */
export const demoSeedItems = pgTable("demo_seed_items", {
  code: text("code").primaryKey(),
  label: text("label").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/*
 * # images テーブル
 *
 * ## 目的
 * 11-2.data-02 で扱う画像メタデータを保持する。
 *
 * ## 説明
 * image_path は S3 key を想定。重複登録を防ぐため unique 制約を付与する。
 */
export const images = pgTable("images", {
  imageId: text("image_id").primaryKey(),
  imagePath: text("image_path").notNull().unique(),
  fileName: text("file_name").notNull(),
  contentType: text("content_type").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/*
 * # users テーブル
 *
 * ## 目的
 * アプリで利用するユーザー情報を保持する。
 *
 * ## 説明
 * uid は Cognito sub を保存する。username は一意制約で重複登録を防ぐ。
 */
export const users = pgTable("users", {
  uid: text("uid").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull(),
  userType: text("user_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
