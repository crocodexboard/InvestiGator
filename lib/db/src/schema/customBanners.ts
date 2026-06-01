import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const customBannersTable = pgTable("custom_banners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  patternType: text("pattern_type").notNull(),
  primaryColor: text("primary_color").notNull().default("#ff0000"),
  secondaryColor: text("secondary_color").notNull().default("#8b0000"),
  bgColor: text("bg_color").notNull().default("#0a0000"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CustomBanner = typeof customBannersTable.$inferSelect;
