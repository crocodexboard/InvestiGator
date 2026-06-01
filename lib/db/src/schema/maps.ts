import { pgTable, serial, text, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const mapsTable = pgTable("maps", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  imageData: text("image_data").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pinpointsTable = pgTable("pinpoints", {
  id: serial("id").primaryKey(),
  mapId: integer("map_id").notNull().references(() => mapsTable.id, { onDelete: "cascade" }),
  type: text("type").notNull().default("live"),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  imageData: text("image_data").notNull().default(""),
  xPercent: real("x_percent").notNull().default(50),
  yPercent: real("y_percent").notNull().default(50),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userLocationsTable = pgTable("user_locations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  pinpointId: integer("pinpoint_id").notNull().references(() => pinpointsTable.id, { onDelete: "cascade" }),
  description: text("description").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMapSchema = createInsertSchema(mapsTable).omit({ id: true, createdAt: true });
export const insertPinpointSchema = createInsertSchema(pinpointsTable).omit({ id: true, createdAt: true });
export const insertUserLocationSchema = createInsertSchema(userLocationsTable).omit({ id: true, createdAt: true });

export type InsertMap = z.infer<typeof insertMapSchema>;
export type MapRow = typeof mapsTable.$inferSelect;
export type InsertPinpoint = z.infer<typeof insertPinpointSchema>;
export type PinpointRow = typeof pinpointsTable.$inferSelect;
export type InsertUserLocation = z.infer<typeof insertUserLocationSchema>;
export type UserLocationRow = typeof userLocationsTable.$inferSelect;
