import {
  pgTable,
  text,
  varchar,
  boolean,
  bigint,
  integer,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  username: varchar("username", { length: 32 }).unique().notNull(),
  display_name: varchar("display_name", { length: 32 }),
  password: text("password").notNull(),
  avatar: text("avatar"),
  banner: text("banner"),
  bio: text("bio"),
  flags: bigint("flags", { mode: "number" }),
});

export const userSettings = pgTable("user_settings", {
  user_id: bigint("user_id", { mode: "number" }).references(() => users.id, {
    onDelete: "cascade",
  }),
  theme: text("theme"),
  status: integer("status"),
});

export const tracks = pgTable("tracks", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  author_id: text("author_id").references(() => users.id, {
    onDelete: "set null",
  }),
  content: varchar("content", { length: 4096 }),
  // NOTE:
  // null = never commented or retracked
  // * = there is a track
  referenced_track_id: bigint("referenced_track_id", { mode: "number" }),
  retrack: boolean("retrack"),
});

export const follows = pgTable("follows", {
  origin_user_id: bigint("origin_user_id", { mode: "number" }).references(
    () => users.id,
  ),
  target_user_id: bigint("target_user_id", { mode: "number" }).references(
    () => users.id,
  ),
});
