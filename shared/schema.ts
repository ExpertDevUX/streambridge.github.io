import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const streams = pgTable("streams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  rtmpUrl: text("rtmp_url").notNull(),
  status: text("status").notNull().default("pending"), // pending, active, stopped, error
  quality: text("quality").notNull().default("720p"),
  duration: integer("duration").default(0), // in seconds
  fileSize: integer("file_size").default(0), // in bytes
  hlsPath: text("hls_path"),
  dashPath: text("dash_path"),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  startedAt: timestamp("started_at"),
  stoppedAt: timestamp("stopped_at"),
});

export const insertStreamSchema = createInsertSchema(streams).pick({
  name: true,
  rtmpUrl: true,
  quality: true,
});

export type InsertStream = z.infer<typeof insertStreamSchema>;
export type Stream = typeof streams.$inferSelect;
