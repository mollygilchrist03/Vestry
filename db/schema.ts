import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const boardRoleEnum = pgEnum("board_role", ["owner", "moderator"]);
export const questionStatusEnum = pgEnum("question_status", [
  "pending",
  "answered",
  "hidden",
  "deleted",
]);
export const replyVisibilityEnum = pgEnum("reply_visibility", [
  "public",
  "private",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const churches = pgTable("churches", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  inviteCode: text("invite_code").notNull().unique(),
  allowAnonymous: boolean("allow_anonymous").notNull().default(true),
  publicBoardEnabled: boolean("public_board_enabled").notNull().default(true),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const boardAdmins = pgTable("board_admins", {
  id: uuid("id").primaryKey().defaultRandom(),
  boardId: uuid("board_id")
    .notNull()
    .references(() => churches.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  role: boardRoleEnum("role").notNull().default("moderator"),
});

export const questions = pgTable("questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  boardId: uuid("board_id")
    .notNull()
    .references(() => churches.id),
  displayName: text("display_name"),
  questionText: text("question_text").notNull(),
  threadToken: text("thread_token").notNull().unique(),
  isPublic: boolean("is_public").notNull().default(false),
  status: questionStatusEnum("status").notNull().default("pending"),
  flaggedSensitive: boolean("flagged_sensitive").notNull().default(false),
  optionalContact: text("optional_contact"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const replies = pgTable("replies", {
  id: uuid("id").primaryKey().defaultRandom(),
  questionId: uuid("question_id")
    .notNull()
    .references(() => questions.id),
  boardAdminId: uuid("board_admin_id")
    .notNull()
    .references(() => boardAdmins.id),
  replyText: text("reply_text").notNull(),
  visibility: replyVisibilityEnum("visibility").notNull().default("public"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
