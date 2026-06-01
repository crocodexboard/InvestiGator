import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const customSkinsTable = pgTable("custom_skins", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  glowColor: text("glow_color").notNull().default("#ff0000"),
  glowEnabled: boolean("glow_enabled").notNull().default(true),
  borderColor: text("border_color").notNull().default("#ff0000"),
  bgGradientFrom: text("bg_gradient_from").notNull().default("#0a0a0a"),
  bgGradientTo: text("bg_gradient_to").notNull().default("#1a0000"),
  accessories: text("accessories").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCustomSkinSchema = createInsertSchema(customSkinsTable).omit({ id: true, createdAt: true });
export type InsertCustomSkin = z.infer<typeof insertCustomSkinSchema>;
export type CustomSkin = typeof customSkinsTable.$inferSelect;
