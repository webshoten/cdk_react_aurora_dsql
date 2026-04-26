import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

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
