import {
  users, organizations, complaints, feedbacks, notifications,
  type User, type Organization, type Complaint, type Feedback, type Notification,
  type InsertUser, type InsertOrganization, type InsertComplaint, type InsertFeedback, type InsertNotification
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private organizations: Map<number, Organization>;
  private complaints: Map<number, Complaint>;
  private feedbacks: Map<number, Feedback>;
  private notifications: Map<number, Notification>;
  private userId: number;
  private organizationId: number;
  private complaintId: number;
  private feedbackId: number;
  private notificationId: number;

  constructor() {
    this.users = new Map();
    this.organizations = new Map();
    this.complaints = new Map();
    this.feedbacks = new Map();
    this.notifications = new Map();
    this.userId = 1;
    this.organizationId = 1;
    this.complaintId = 1;
    this.feedbackId = 1;
    this.notificationId = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByAccessKey(accessKey: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.accessKey === accessKey
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const createdAt = new Date();
    
    // Ensure isAdmin has a default value if not provided
    const isAdmin = insertUser.isAdmin ?? false;
    
    // Ensure organizationId is null if not provided
    const organizationId = insertUser.organizationId ?? null;
    
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt, 
      isAdmin,
      organizationId
    };
    
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUsersByOrganizationId(organizationId: number): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.organizationId === organizationId
    );
  }

  // Organization operations
  async getOrganization(id: number): Promise<Organization | undefined> {
    return this.organizations.get(id);
  }

  async getOrganizationByAccessKey(accessKey: string): Promise<Organization | undefined> {
    return Array.from(this.organizations.values()).find(
      (org) => org.accessKey === accessKey
    );
  }

  async createOrganization(insertOrganization: InsertOrganization): Promise<Organization> {
    const id = this.organizationId++;
    const createdAt = new Date();
    
    // Ensure required fields have default values
    const description = insertOrganization.description ?? null;
    const thresholdPercentage = insertOrganization.thresholdPercentage ?? 15;
    
    const organization: Organization = { 
      ...insertOrganization, 
      id, 
      createdAt,
      description,
      thresholdPercentage
    };
    
    this.organizations.set(id, organization);
    return organization;
  }

  async getAllOrganizations(): Promise<Organization[]> {
    return Array.from(this.organizations.values());
  }

  // Complaint operations
  async getComplaint(id: number): Promise<Complaint | undefined> {
    return this.complaints.get(id);
  }

  async createComplaint(insertComplaint: InsertComplaint): Promise<Complaint> {
    const id = this.complaintId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    // Set default values for optional fields
    const status = insertComplaint.status ?? "pending";
    const escalated = insertComplaint.escalated ?? false;
    const similarityGroup = insertComplaint.similarityGroup ?? null;
    
    const complaint: Complaint = { 
      ...insertComplaint, 
      id, 
      createdAt, 
      updatedAt,
      status: status as any, // Type coercion for the enum
      escalated,
      similarityGroup
    };
    
    this.complaints.set(id, complaint);
    return complaint;
  }

  async updateComplaintStatus(id: number, status: string): Promise<Complaint | undefined> {
    const complaint = this.complaints.get(id);
    if (!complaint) return undefined;

    const updatedComplaint: Complaint = { 
      ...complaint, 
      status: status as any, // Type coercion for the enum
      updatedAt: new Date(),
    };
    this.complaints.set(id, updatedComplaint);
    return updatedComplaint;
  }

  async updateComplaintCategory(id: number, category: string, similarityGroup: string): Promise<Complaint | undefined> {
    const complaint = this.complaints.get(id);
    if (!complaint) return undefined;

    const updatedComplaint: Complaint = { 
      ...complaint, 
      category: category as any, // Type coercion for the enum
      similarityGroup,
      updatedAt: new Date(),
    };
    this.complaints.set(id, updatedComplaint);
    return updatedComplaint;
  }

  async getComplaintsByOrganizationId(organizationId: number): Promise<Complaint[]> {
    return Array.from(this.complaints.values()).filter(
      (complaint) => complaint.organizationId === organizationId
    );
  }

  async getComplaintsByUserId(userId: number): Promise<Complaint[]> {
    return Array.from(this.complaints.values()).filter(
      (complaint) => complaint.userId === userId
    );
  }

  async getComplaintsBySimilarityGroup(similarityGroup: string): Promise<Complaint[]> {
    return Array.from(this.complaints.values()).filter(
      (complaint) => complaint.similarityGroup === similarityGroup
    );
  }

  // Feedback operations
  async getFeedback(id: number): Promise<Feedback | undefined> {
    return this.feedbacks.get(id);
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = this.feedbackId++;
    const createdAt = new Date();
    
    // Ensure comment has a default value
    const comment = insertFeedback.comment ?? null;
    
    const feedback: Feedback = { 
      ...insertFeedback, 
      id, 
      createdAt,
      comment
    };
    
    this.feedbacks.set(id, feedback);
    return feedback;
  }

  async getFeedbacksByComplaintId(complaintId: number): Promise<Feedback[]> {
    return Array.from(this.feedbacks.values()).filter(
      (feedback) => feedback.complaintId === complaintId
    );
  }

  // Notification operations
  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.notificationId++;
    const createdAt = new Date();
    
    // Ensure required fields have default values
    const userId = insertNotification.userId ?? null;
    const isRead = insertNotification.isRead ?? false;
    
    const notification: Notification = { 
      ...insertNotification, 
      id, 
      createdAt,
      userId,
      isRead
    };
    
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;

    const updatedNotification: Notification = { ...notification, isRead: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      (notification) => notification.userId === userId
    );
  }

  async getNotificationsByOrganizationId(organizationId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(
      (notification) => notification.organizationId === organizationId
    );
  }
}

// Database implementation of IStorage with safety checks
export class DatabaseStorage implements IStorage {
  private fallbackStorage: MemStorage;

  constructor() {
    // Initialize fallback storage in case db operations fail
    this.fallbackStorage = new MemStorage();
    console.log('DatabaseStorage initialized with fallback mechanism');
  }

  private async safeDbOperation<T>(operation: () => Promise<T>, fallbackOperation: () => Promise<T>): Promise<T> {
    if (!db) {
      console.warn('Database not available, using fallback storage');
      return fallbackOperation();
    }

    try {
      return await operation();
    } catch (error) {
      console.error('Database operation failed, using fallback storage', error);
      return fallbackOperation();
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.safeDbOperation(
      async () => {
        const [user] = await db!.select().from(users).where(eq(users.id, id));
        return user;
      },
      () => this.fallbackStorage.getUser(id)
    );
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.safeDbOperation(
      async () => {
        const [user] = await db!.select().from(users).where(eq(users.username, username));
        return user;
      },
      () => this.fallbackStorage.getUserByUsername(username)
    );
  }

  async getUserByAccessKey(accessKey: string): Promise<User | undefined> {
    return this.safeDbOperation(
      async () => {
        const [user] = await db!.select().from(users).where(eq(users.accessKey, accessKey));
        return user;
      },
      () => this.fallbackStorage.getUserByAccessKey(accessKey)
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return this.safeDbOperation(
      async () => {
        const [user] = await db!.insert(users).values(insertUser).returning();
        return user;
      },
      () => this.fallbackStorage.createUser(insertUser)
    );
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    return this.safeDbOperation(
      async () => {
        const [updatedUser] = await db!
          .update(users)
          .set(userData)
          .where(eq(users.id, id))
          .returning();
        return updatedUser;
      },
      () => this.fallbackStorage.updateUser(id, userData)
    );
  }

  async getUsersByOrganizationId(organizationId: number): Promise<User[]> {
    return this.safeDbOperation(
      async () => await db!
        .select()
        .from(users)
        .where(eq(users.organizationId, organizationId)),
      () => this.fallbackStorage.getUsersByOrganizationId(organizationId)
    );
  }

  // Organization operations
  async getOrganization(id: number): Promise<Organization | undefined> {
    return this.safeDbOperation(
      async () => {
        const [organization] = await db!
          .select()
          .from(organizations)
          .where(eq(organizations.id, id));
        return organization;
      },
      () => this.fallbackStorage.getOrganization(id)
    );
  }

  async getOrganizationByAccessKey(accessKey: string): Promise<Organization | undefined> {
    return this.safeDbOperation(
      async () => {
        const [organization] = await db!
          .select()
          .from(organizations)
          .where(eq(organizations.accessKey, accessKey));
        return organization;
      },
      () => this.fallbackStorage.getOrganizationByAccessKey(accessKey)
    );
  }

  async createOrganization(insertOrganization: InsertOrganization): Promise<Organization> {
    return this.safeDbOperation(
      async () => {
        const [organization] = await db!
          .insert(organizations)
          .values(insertOrganization)
          .returning();
        return organization;
      },
      () => this.fallbackStorage.createOrganization(insertOrganization)
    );
  }

  async getAllOrganizations(): Promise<Organization[]> {
    return this.safeDbOperation(
      async () => await db!.select().from(organizations),
      () => this.fallbackStorage.getAllOrganizations()
    );
  }

  // Complaint operations
  async getComplaint(id: number): Promise<Complaint | undefined> {
    return this.safeDbOperation(
      async () => {
        const [complaint] = await db!
          .select()
          .from(complaints)
          .where(eq(complaints.id, id));
        return complaint;
      },
      () => this.fallbackStorage.getComplaint(id)
    );
  }

  async createComplaint(insertComplaint: InsertComplaint): Promise<Complaint> {
    return this.safeDbOperation(
      async () => {
        const [complaint] = await db!
          .insert(complaints)
          .values(insertComplaint)
          .returning();
        return complaint;
      },
      () => this.fallbackStorage.createComplaint(insertComplaint)
    );
  }

  async updateComplaintStatus(id: number, status: string): Promise<Complaint | undefined> {
    return this.safeDbOperation(
      async () => {
        const [updatedComplaint] = await db!
          .update(complaints)
          .set({ 
            status: status as any,
            updatedAt: new Date()
          })
          .where(eq(complaints.id, id))
          .returning();
        return updatedComplaint;
      },
      () => this.fallbackStorage.updateComplaintStatus(id, status)
    );
  }

  async updateComplaintCategory(id: number, category: string, similarityGroup: string): Promise<Complaint | undefined> {
    return this.safeDbOperation(
      async () => {
        const [updatedComplaint] = await db!
          .update(complaints)
          .set({ 
            category: category as any,
            similarityGroup,
            updatedAt: new Date()
          })
          .where(eq(complaints.id, id))
          .returning();
        return updatedComplaint;
      },
      () => this.fallbackStorage.updateComplaintCategory(id, category, similarityGroup)
    );
  }

  async getComplaintsByOrganizationId(organizationId: number): Promise<Complaint[]> {
    return this.safeDbOperation(
      async () => await db!
        .select()
        .from(complaints)
        .where(eq(complaints.organizationId, organizationId))
        .orderBy(desc(complaints.createdAt)),
      () => this.fallbackStorage.getComplaintsByOrganizationId(organizationId)
    );
  }

  async getComplaintsByUserId(userId: number): Promise<Complaint[]> {
    return this.safeDbOperation(
      async () => await db!
        .select()
        .from(complaints)
        .where(eq(complaints.userId, userId))
        .orderBy(desc(complaints.createdAt)),
      () => this.fallbackStorage.getComplaintsByUserId(userId)
    );
  }

  async getComplaintsBySimilarityGroup(similarityGroup: string): Promise<Complaint[]> {
    return this.safeDbOperation(
      async () => await db!
        .select()
        .from(complaints)
        .where(eq(complaints.similarityGroup, similarityGroup))
        .orderBy(desc(complaints.createdAt)),
      () => this.fallbackStorage.getComplaintsBySimilarityGroup(similarityGroup)
    );
  }

  // Feedback operations
  async getFeedback(id: number): Promise<Feedback | undefined> {
    return this.safeDbOperation(
      async () => {
        const [feedback] = await db!
          .select()
          .from(feedbacks)
          .where(eq(feedbacks.id, id));
        return feedback;
      },
      () => this.fallbackStorage.getFeedback(id)
    );
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    return this.safeDbOperation(
      async () => {
        const [feedback] = await db!
          .insert(feedbacks)
          .values(insertFeedback)
          .returning();
        return feedback;
      },
      () => this.fallbackStorage.createFeedback(insertFeedback)
    );
  }

  async getFeedbacksByComplaintId(complaintId: number): Promise<Feedback[]> {
    return this.safeDbOperation(
      async () => await db!
        .select()
        .from(feedbacks)
        .where(eq(feedbacks.complaintId, complaintId))
        .orderBy(desc(feedbacks.createdAt)),
      () => this.fallbackStorage.getFeedbacksByComplaintId(complaintId)
    );
  }

  // Notification operations
  async getNotification(id: number): Promise<Notification | undefined> {
    return this.safeDbOperation(
      async () => {
        const [notification] = await db!
          .select()
          .from(notifications)
          .where(eq(notifications.id, id));
        return notification;
      },
      () => this.fallbackStorage.getNotification(id)
    );
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    return this.safeDbOperation(
      async () => {
        const [notification] = await db!
          .insert(notifications)
          .values(insertNotification)
          .returning();
        return notification;
      },
      () => this.fallbackStorage.createNotification(insertNotification)
    );
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    return this.safeDbOperation(
      async () => {
        const [updatedNotification] = await db!
          .update(notifications)
          .set({ isRead: true })
          .where(eq(notifications.id, id))
          .returning();
        return updatedNotification;
      },
      () => this.fallbackStorage.markNotificationAsRead(id)
    );
  }

  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return this.safeDbOperation(
      async () => await db!
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt)),
      () => this.fallbackStorage.getNotificationsByUserId(userId)
    );
  }

  async getNotificationsByOrganizationId(organizationId: number): Promise<Notification[]> {
    return this.safeDbOperation(
      async () => await db!
        .select()
        .from(notifications)
        .where(eq(notifications.organizationId, organizationId))
        .orderBy(desc(notifications.createdAt)),
      () => this.fallbackStorage.getNotificationsByOrganizationId(organizationId)
    );
  }
}

// If the database connection is available, use DatabaseStorage
// Otherwise, fall back to MemStorage for development
import { dbAvailable } from "./db";

// Use the database storage if available, otherwise fallback to in-memory storage
export const storage = dbAvailable ? new DatabaseStorage() : new MemStorage();