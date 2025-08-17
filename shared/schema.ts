import { pgTable, text, serial, integer, boolean, timestamp, varchar, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Enums
export const complaintStatusEnum = pgEnum('complaint_status', ['pending', 'resolved', 'escalated']);
export const complaintCategoryEnum = pgEnum('complaint_category', ['hr', 'infrastructure', 'management', 'cafeteria', 'security', 'other']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  pseudonym: text("pseudonym").notNull(),
  accessKey: text("access_key").notNull().unique(),
  organizationId: integer("organization_id"),
  isAdmin: boolean("is_admin").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Organizations table
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  accessKey: text("access_key").notNull().unique(),
  thresholdPercentage: integer("threshold_percentage").default(15).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Complaints table
export const complaints = pgTable("complaints", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  category: complaintCategoryEnum("category").notNull(),
  status: complaintStatusEnum("status").default('pending').notNull(),
  similarityGroup: text("similarity_group"),
  escalated: boolean("escalated").default(false).notNull(),
  userId: integer("user_id").notNull(),
  organizationId: integer("organization_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Feedbacks table
export const feedbacks = pgTable("feedbacks", {
  id: serial("id").primaryKey(),
  complaintId: integer("complaint_id").notNull(),
  userId: integer("user_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  userId: integer("user_id"),
  organizationId: integer("organization_id").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User-Organization relationship table to track memberships and roles
export const userOrganizations = pgTable("user_organizations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  organizationId: integer("organization_id").notNull().references(() => organizations.id),
  role: text("role").notNull().default("member"), // "admin" or "member"
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  complaints: many(complaints),
  feedbacks: many(feedbacks),
  notifications: many(notifications),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  complaints: many(complaints),
  notifications: many(notifications),
}));

export const complaintsRelations = relations(complaints, ({ one, many }) => ({
  user: one(users, {
    fields: [complaints.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [complaints.organizationId],
    references: [organizations.id],
  }),
  feedbacks: many(feedbacks),
}));

export const feedbacksRelations = relations(feedbacks, ({ one }) => ({
  complaint: one(complaints, {
    fields: [feedbacks.complaintId],
    references: [complaints.id],
  }),
  user: one(users, {
    fields: [feedbacks.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [notifications.organizationId],
    references: [organizations.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
});

export const insertComplaintSchema = createInsertSchema(complaints).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedbacks).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type Complaint = typeof complaints.$inferSelect;
export type Feedback = typeof feedbacks.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export const insertUserOrganizationSchema = createInsertSchema(userOrganizations);
export type UserOrganization = typeof userOrganizations.$inferSelect;
export type InsertUserOrganization = z.infer<typeof insertUserOrganizationSchema>;
