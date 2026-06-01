import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const borderInventoryTable = pgTable("border_inventory", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  borderName: text("border_name").notNull(),
  grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBorderInventorySchema = createInsertSchema(borderInventoryTable).omit({
  id: true,
  grantedAt: true,
});

export type InsertBorderInventory = z.infer<typeof insertBorderInventorySchema>;
export type BorderInventoryRow = typeof borderInventoryTable.$inferSelect;
