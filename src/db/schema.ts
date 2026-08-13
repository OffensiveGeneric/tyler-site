import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const photos = sqliteTable("photos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  filename: text("filename").notNull(),
  title: text("title"),
  caption: text("caption"),
  dateTaken: text("date_taken"),
  camera: text("camera"),
  lens: text("lens"),
  width: integer("width"),
  height: integer("height"),
  orientation: text("orientation"),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export type Photo = typeof photos.$inferSelect;
