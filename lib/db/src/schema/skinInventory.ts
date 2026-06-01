import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const skinInventoryTable = pgTable("skin_inventory", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  skinName: text("skin_name").notNull(),
  grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSkinInventorySchema = createInsertSchema(skinInventoryTable).omit({
  id: true,
  grantedAt: true,
});

export type InsertSkinInventory = z.infer<typeof insertSkinInventorySchema>;
export type SkinInventoryRow = typeof skinInventoryTable.$inferSelect;
