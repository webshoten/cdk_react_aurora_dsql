import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const demoSeedItems = pgTable("demo_seed_items", {
  code: text("code").primaryKey(),
  label: text("label").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
