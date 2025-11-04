import { pgTable, uuid, varchar, text, integer, timestamp, date, jsonb, pgEnum, boolean } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

// Enums
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "canceled", "past_due", "trialing"]);
export const subscriptionPlanEnum = pgEnum("subscription_plan", ["ai_analyzer", "ai_analyzer_plus"]);
export const contractStatusEnum = pgEnum("contract_status", ["uploaded", "processing", "analyzed", "failed"]);
export const humanReviewStatusEnum = pgEnum("human_review_status", [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "succeeded", "failed", "refunded"]);
export const paymentTypeEnum = pgEnum("payment_type", ["subscription", "human_review", "one_time"]);
export const emailNotificationTypeEnum = pgEnum("email_notification_type", [
  "analysis_ready",
  "comparison_ready",
  "human_review_ready",
  "billing",
]);
export const emailNotificationStatusEnum = pgEnum("email_notification_status", ["pending", "sent", "failed"]);

// User profiles table - extends better-auth user with app-specific fields
export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  subscriptionStatus: subscriptionStatusEnum("subscription_status"),
  subscriptionPlan: subscriptionPlanEnum("subscription_plan"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Contracts table
export const contracts = pgTable("policies", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  originalFileName: varchar("original_file_name", { length: 255 }).notNull(),
  s3Key: varchar("s3_key", { length: 500 }).notNull(),
  s3Bucket: varchar("s3_bucket", { length: 255 }).notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull().default("application/pdf"),
  coverageStart: date("coverage_start").notNull(), // Required: Coverage start date (ISO 8601: YYYY-MM-DD)
  coverageEnd: date("coverage_end"), // Optional: Coverage end date (ISO 8601: YYYY-MM-DD), defaults to 1 year from start
  description: text("description"),
  status: contractStatusEnum("status").notNull().default("uploaded"),
  isDeleted: boolean("is_deleted").notNull().default(false),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Analyses table
export const analyses = pgTable("analyses", {
  id: uuid("id").primaryKey().defaultRandom(),
  contractId: uuid("contract_id")
    .notNull()
    .unique()
    .references(() => contracts.id, { onDelete: "cascade" }),
  summary: text("summary").notNull(),
  keyTerms: jsonb("key_terms").notNull(),
  coverageDetails: jsonb("coverage_details").notNull(),
  exclusions: jsonb("exclusions").notNull(),
  premiums: jsonb("premiums").notNull(),
  missedCoverage: jsonb("missed_coverage"),
  coverageGaps: jsonb("coverage_gaps"),
  hiddenClauses: jsonb("hidden_clauses"),
  commonIssues: jsonb("common_issues"),
  roofingSidingAnalysis: jsonb("roofing_siding_analysis"),
  aiModel: varchar("ai_model", { length: 100 }).notNull(),
  aiTokensUsed: integer("ai_tokens_used").notNull(),
  analysisPrompt: text("analysis_prompt"),
  analysisResult: text("analysis_result").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Comparisons table
export const comparisons = pgTable("comparisons", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  previousContractId: uuid("previous_contract_id")
    .notNull()
    .references(() => contracts.id, { onDelete: "cascade" }),
  newContractId: uuid("new_contract_id")
    .notNull()
    .references(() => contracts.id, { onDelete: "cascade" }),
  changesDetected: jsonb("changes_detected").notNull(),
  summary: text("summary").notNull(),
  aiModel: varchar("ai_model", { length: 100 }).notNull(),
  aiTokensUsed: integer("ai_tokens_used").notNull(),
  comparisonResult: text("comparison_result").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Human reviews table
export const humanReviews = pgTable("human_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  contractId: uuid("contract_id").references(() => contracts.id, { onDelete: "cascade" }),
  analysisId: uuid("analysis_id").references(() => analyses.id, { onDelete: "cascade" }),
  comparisonId: uuid("comparison_id").references(() => comparisons.id, { onDelete: "cascade" }),
  status: humanReviewStatusEnum("status").notNull().default("pending"),
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  reviewerNotes: text("reviewer_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Subscriptions table
export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }).notNull().unique(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).notNull(),
  status: subscriptionStatusEnum("status").notNull(),
  plan: subscriptionPlanEnum("plan").notNull(),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Payments table
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }).notNull().unique(),
  amount: integer("amount").notNull(), // in cents
  currency: varchar("currency", { length: 10 }).notNull().default("usd"),
  status: paymentStatusEnum("status").notNull(),
  type: paymentTypeEnum("type").notNull(),
  humanReviewId: uuid("human_review_id").references(() => humanReviews.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Email notifications table
export const emailNotifications = pgTable("email_notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  type: emailNotificationTypeEnum("type").notNull(),
  contractId: uuid("contract_id").references(() => contracts.id, { onDelete: "cascade" }),
  analysisId: uuid("analysis_id").references(() => analyses.id, { onDelete: "cascade" }),
  comparisonId: uuid("comparison_id").references(() => comparisons.id, { onDelete: "cascade" }),
  resendEmailId: varchar("resend_email_id", { length: 255 }),
  status: emailNotificationStatusEnum("status").notNull().default("pending"),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Export types
export type UserProfile = typeof userProfiles.$inferSelect;
export type NewUserProfile = typeof userProfiles.$inferInsert;
export type Contract = typeof contracts.$inferSelect;
export type NewContract = typeof contracts.$inferInsert;
export type Analysis = typeof analyses.$inferSelect;
export type NewAnalysis = typeof analyses.$inferInsert;
export type Comparison = typeof comparisons.$inferSelect;
export type NewComparison = typeof comparisons.$inferInsert;
export type HumanReview = typeof humanReviews.$inferSelect;
export type NewHumanReview = typeof humanReviews.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type EmailNotification = typeof emailNotifications.$inferSelect;
export type NewEmailNotification = typeof emailNotifications.$inferInsert;
