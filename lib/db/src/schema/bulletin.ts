import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const bulletinTable = pgTable("bulletin", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // "upcoming_event" | "monthly_quest" | "rules" | "link"
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  url: text("url").notNull().default(""),
  sortOrder: text("sort_order").notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBulletinSchema = createInsertSchema(bulletinTable).omit({ id: true, createdAt: true });
export type InsertBulletin = z.infer<typeof insertBulletinSchema>;
export type Bulletin = typeof bulletinTable.$inferSelect;
