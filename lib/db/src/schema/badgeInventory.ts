import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const badgeInventoryTable = pgTable("badge_inventory", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  badgeName: text("badge_name").notNull(),
  grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBadgeInventorySchema = createInsertSchema(badgeInventoryTable).omit({
  id: true,
  grantedAt: true,
});

export type InsertBadgeInventory = z.infer<typeof insertBadgeInventorySchema>;
export type BadgeInventoryRow = typeof badgeInventoryTable.$inferSelect;
