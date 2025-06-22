import {
  users, organizations, complaints, feedbacks, notifications,
  type User, type Organization, type Complaint, type Feedback, type Notification,
  type InsertUser, type InsertOrganization, type InsertComplaint, type InsertFeedback, type InsertNotification
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByAccessKey(accessKey: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  getUsersByOrganizationId(organizationId: number): Promise<User[]>;

  // Organization operations
  getOrganization(id: number): Promise<Organization | undefined>;
  getOrganizationByAccessKey(accessKey: string): Promise<Organization | undefined>;
  createOrganization(organization: InsertOrganization): Promise<Organization>;
  getAllOrganizations(): Promise<Organization[]>;

  // Complaint operations
  getComplaint(id: number): Promise<Complaint | undefined>;
  createComplaint(complaint: InsertComplaint): Promise<Complaint>;
  updateComplaintStatus(id: number, status: string): Promise<Complaint | undefined>;
  updateComplaintCategory(id: number, category: string, similarityGroup: string): Promise<Complaint | undefined>;
  getComplaintsByOrganizationId(organizationId: number): Promise<Complaint[]>;
  getComplaintsByUserId(userId: number): Promise<Complaint[]>;
  getComplaintsBySimilarityGroup(similarityGroup: string): Promise<Complaint[]>;
  getComplaintStats(organizationId: number): Promise<any>;
  
  // Feedback operations
  getFeedback(id: number): Promise<Feedback | undefined>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedbacksByComplaintId(complaintId: number): Promise<Feedback[]>;

  // Notification operations
  getNotification(id: number): Promise<Notification | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  getNotificationsByUserId(userId: number): Promise<Notification[]>;
  getNotificationsByOrganizationId(organizationId: number): Promise<Notification[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByAccessKey(accessKey: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.accessKey, accessKey));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUsersByOrganizationId(organizationId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.organizationId, organizationId));
  }

  // Organization operations
  async getOrganization(id: number): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org;
  }

  async getOrganizationByAccessKey(accessKey: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.accessKey, accessKey));
    return org;
  }

  async createOrganization(insertOrganization: InsertOrganization): Promise<Organization> {
    const [org] = await db.insert(organizations).values(insertOrganization).returning();
    return org;
  }

  async getAllOrganizations(): Promise<Organization[]> {
    return await db.select().from(organizations);
  }

  // Complaint operations
  async getComplaint(id: number): Promise<Complaint | undefined> {
    const [complaint] = await db.select().from(complaints).where(eq(complaints.id, id));
    return complaint;
  }

  async createComplaint(insertComplaint: InsertComplaint): Promise<Complaint> {
    const [complaint] = await db.insert(complaints).values(insertComplaint).returning();
    return complaint;
  }

  async updateComplaintStatus(id: number, status: string): Promise<Complaint | undefined> {
    const [complaint] = await db
      .update(complaints)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(complaints.id, id))
      .returning();
    return complaint;
  }

  async updateComplaintCategory(id: number, category: string, similarityGroup: string): Promise<Complaint | undefined> {
    const [complaint] = await db
      .update(complaints)
      .set({ 
        category: category as any, 
        similarityGroup,
        updatedAt: new Date()
      })
      .where(eq(complaints.id, id))
      .returning();
    return complaint;
  }

  async getComplaintsByOrganizationId(organizationId: number): Promise<Complaint[]> {
    return await db
      .select()
      .from(complaints)
      .where(eq(complaints.organizationId, organizationId))
      .orderBy(desc(complaints.createdAt));
  }

  async getComplaintsByUserId(userId: number): Promise<Complaint[]> {
    return await db
      .select()
      .from(complaints)
      .where(eq(complaints.userId, userId))
      .orderBy(desc(complaints.createdAt));
  }

  async getComplaintsBySimilarityGroup(similarityGroup: string): Promise<Complaint[]> {
    return await db
      .select()
      .from(complaints)
      .where(eq(complaints.similarityGroup, similarityGroup));
  }

  async getComplaintStats(organizationId: number): Promise<any> {
    const totalResult = await db
      .select({ count: count() })
      .from(complaints)
      .where(eq(complaints.organizationId, organizationId));

    const statusResults = await db
      .select({ 
        status: complaints.status, 
        count: count() 
      })
      .from(complaints)
      .where(eq(complaints.organizationId, organizationId))
      .groupBy(complaints.status);

    const categoryResults = await db
      .select({ 
        category: complaints.category, 
        count: count() 
      })
      .from(complaints)
      .where(eq(complaints.organizationId, organizationId))
      .groupBy(complaints.category);

    return {
      total: totalResult[0]?.count || 0,
      byStatus: statusResults,
      byCategory: categoryResults
    };
  }

  // Feedback operations
  async getFeedback(id: number): Promise<Feedback | undefined> {
    const [feedback] = await db.select().from(feedbacks).where(eq(feedbacks.id, id));
    return feedback;
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const [feedback] = await db.insert(feedbacks).values(insertFeedback).returning();
    return feedback;
  }

  async getFeedbacksByComplaintId(complaintId: number): Promise<Feedback[]> {
    return await db.select().from(feedbacks).where(eq(feedbacks.complaintId, complaintId));
  }

  // Notification operations
  async getNotification(id: number): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification;
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(insertNotification).returning();
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const [notification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }

  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async getNotificationsByOrganizationId(organizationId: number): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.organizationId, organizationId))
      .orderBy(desc(notifications.createdAt));
  }
}

export const storage = new DatabaseStorage();
