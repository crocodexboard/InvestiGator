import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const customBordersTable = pgTable("custom_borders", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageData: text("image_data").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCustomBorderSchema = createInsertSchema(customBordersTable).omit({ id: true, createdAt: true });
export type InsertCustomBorder = z.infer<typeof insertCustomBorderSchema>;
export type CustomBorder = typeof customBordersTable.$inferSelect;
