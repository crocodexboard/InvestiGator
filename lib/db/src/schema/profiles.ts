import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const profilesTable = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => usersTable.id, { onDelete: "set null" }),
  username: text("username").notNull(),
  displayName: text("display_name").notNull(),
  favoriteColor: text("favorite_color").notNull(),
  bio: text("bio").notNull().default(""),
  imageData: text("image_data").notNull().default(""),
  ageGroup: text("age_group").notNull().default("13-15"),
  badges: text("badges").array().notNull().default([]),
  traits: text("traits").array().notNull().default([]),
  skin: text("skin").notNull().default("Red"),
  banner: text("banner"),
  boarder: text("boarder"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProfileSchema = createInsertSchema(profilesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profilesTable.$inferSelect;
