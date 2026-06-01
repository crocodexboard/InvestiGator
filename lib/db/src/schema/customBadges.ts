import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const customBadgesTable = pgTable("custom_badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull().default("#ffd700"),
  accessory: text("accessory").notNull().default("none"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCustomBadgeSchema = createInsertSchema(customBadgesTable).omit({ id: true, createdAt: true });
export type InsertCustomBadge = z.infer<typeof insertCustomBadgeSchema>;
export type CustomBadge = typeof customBadgesTable.$inferSelect;
