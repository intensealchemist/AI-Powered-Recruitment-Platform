import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  role: text("role").notNull(),
  company: text("company"),
  designation: text("designation"),
  image: text("image"),
  demo: integer("demo", { mode: "boolean" }).default(false),
  verified: integer("verified", { mode: "boolean" }).default(false),
});

export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  headline: text("headline").default(""),
  summary: text("summary").default(""),
  aiSummary: text("ai_summary").default(""),
  roleRecommendations: text("role_recommendations", { mode: "json" }).$type<string[]>().default([]),
  completionScore: integer("completion_score").default(0),
  visibility: text("visibility").default("private"),
  shareToken: text("share_token").notNull(),
  publishedAt: text("published_at"),
  pdfVersionHash: text("pdf_version_hash").notNull(),
  lastEditedDeviceId: text("last_edited_device_id"),
  lastConflictAt: text("last_conflict_at"),
  availability: text("availability").default("Open to opportunities"),
  headlineSource: text("headline_source").default("ai"),
  experiences: text("experiences", { mode: "json" }).$type<unknown[]>().default([]),
  skills: text("skills", { mode: "json" }).$type<unknown[]>().default([]),
  projects: text("projects", { mode: "json" }).$type<unknown[]>().default([]),
  education: text("education", { mode: "json" }).$type<unknown[]>().default([]),
  conversationLogs: text("conversation_logs", { mode: "json" }).$type<unknown[]>().default([]),
  updatedAt: text("updated_at").notNull(),
});

export const shortlists = sqliteTable("shortlists", {
  id: text("id").primaryKey(),
  recruiterId: text("recruiter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  candidateId: text("candidate_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  stage: text("stage").notNull(),
  notes: text("notes"),
  addedAt: text("added_at").notNull(),
});
