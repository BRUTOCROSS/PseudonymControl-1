import {
  type User, type Organization, type Complaint, type Feedback, type Notification, type UserOrganization,
  type InsertUser, type InsertOrganization, type InsertComplaint, type InsertFeedback, type InsertNotification, type InsertUserOrganization
} from "@shared/schema";
import type { IStorage } from "./storage";

// In-memory storage for testing while database is being resolved
export class MemoryStorage implements IStorage {
  private users: User[] = [];
  private organizations: Organization[] = [];
  private complaints: Complaint[] = [];
  private feedbacks: Feedback[] = [];
  private notifications: Notification[] = [];
  private userOrganizations: UserOrganization[] = [];
  private nextId = 1;
  private nextUserOrgId = 1; // Added to track next ID for userOrganizations

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async getUserByAccessKey(accessKey: string): Promise<User | undefined> {
    return this.users.find(user => user.accessKey === accessKey);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.nextId++,
      username: insertUser.username,
      password: insertUser.password,
      pseudonym: insertUser.pseudonym,
      accessKey: insertUser.accessKey,
      organizationId: insertUser.organizationId || null,
      isAdmin: insertUser.isAdmin || false,
      createdAt: new Date()
    };
    this.users.push(user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) return undefined;

    this.users[index] = { ...this.users[index], ...userData };
    return this.users[index];
  }

  async getUsersByOrganizationId(organizationId: number): Promise<User[]> {
    // Get all user IDs belonging to this organization from the relationship table
    const memberIds = this.userOrganizations
      .filter(uo => uo.organizationId === organizationId)
      .map(uo => uo.userId);
    
    // Return the full user objects for those IDs
    return this.users.filter(user => memberIds.includes(user.id));
  }

  // Organization operations
  async getOrganization(id: number): Promise<Organization | undefined> {
    if (!id || isNaN(id)) {
      return null;
    }
    return this.organizations.find(org => org.id === id);
  }

  async getOrganizationByAccessKey(accessKey: string): Promise<Organization | undefined> {
    return this.organizations.find(org => org.accessKey === accessKey);
  }

  async createOrganization(insertOrg: InsertOrganization): Promise<Organization> {
    const organization: Organization = {
      id: this.nextId++,
      name: insertOrg.name,
      description: insertOrg.description || null,
      accessKey: insertOrg.accessKey,
      thresholdPercentage: insertOrg.thresholdPercentage || 15,
      createdAt: new Date()
    };
    this.organizations.push(organization);
    return organization;
  }

  async updateOrganization(id: number, organizationData: Partial<Organization>): Promise<Organization | undefined> {
    const index = this.organizations.findIndex(org => org.id === id);
    if (index === -1) return undefined;

    this.organizations[index] = { ...this.organizations[index], ...organizationData };
    return this.organizations[index];
  }

  async getAllOrganizations(): Promise<Organization[]> {
    return this.organizations;
  }

  // Complaint operations
  async getComplaint(id: number): Promise<Complaint | undefined> {
    return this.complaints.find(complaint => complaint.id === id);
  }

  async createComplaint(insertComplaint: InsertComplaint): Promise<Complaint> {
    const complaint: Complaint = {
      id: this.nextId++,
      content: insertComplaint.content,
      category: insertComplaint.category,
      status: insertComplaint.status || 'pending',
      similarityGroup: insertComplaint.similarityGroup || null,
      escalated: insertComplaint.escalated || false,
      userId: insertComplaint.userId,
      organizationId: insertComplaint.organizationId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.complaints.push(complaint);
    return complaint;
  }

  async updateComplaintStatus(id: number, status: string): Promise<Complaint | undefined> {
    const complaint = this.complaints.find(c => c.id === id);
    if (!complaint) return undefined;

    complaint.status = status as any;
    complaint.updatedAt = new Date();
    return complaint;
  }

  async updateComplaintCategory(id: number, category: string, similarityGroup: string): Promise<Complaint | undefined> {
    const complaint = this.complaints.find(c => c.id === id);
    if (!complaint) return undefined;

    complaint.category = category as any;
    complaint.similarityGroup = similarityGroup;
    complaint.updatedAt = new Date();
    return complaint;
  }

  async getComplaintsByOrganizationId(organizationId: number): Promise<Complaint[]> {
    return this.complaints.filter(complaint => complaint.organizationId === organizationId);
  }

  async getComplaintsByUserId(userId: number): Promise<Complaint[]> {
    return this.complaints.filter(complaint => complaint.userId === userId);
  }

  async getComplaintsBySimilarityGroup(similarityGroup: string): Promise<Complaint[]> {
    return this.complaints.filter(complaint => complaint.similarityGroup === similarityGroup);
  }

  async getComplaintStats(organizationId: number): Promise<any> {
    const orgComplaints = this.complaints.filter(c => c.organizationId === organizationId);
    
    // Get non-admin users for threshold-related stats
    const orgUsers = this.users.filter(u => u.organizationId === organizationId);
    const nonAdminUserIds = orgUsers.filter(u => !u.isAdmin).map(u => u.id);
    const nonAdminComplaints = orgComplaints.filter(c => nonAdminUserIds.includes(c.userId));
    
    // Use all complaints for total counts (including admin complaints for visibility)
    const total = orgComplaints.length;
    const pending = orgComplaints.filter(c => c.status === 'pending').length;
    const resolved = orgComplaints.filter(c => c.status === 'resolved').length;
    const escalated = orgComplaints.filter(c => c.status === 'escalated').length;

    return {
      total,
      pending,
      resolved,
      escalated,
      // Total complaints from non-admin users (used for threshold calculations)
      nonAdminTotal: nonAdminComplaints.length,
      categories: {
        hr: orgComplaints.filter(c => c.category === 'hr').length,
        infrastructure: orgComplaints.filter(c => c.category === 'infrastructure').length,
        management: orgComplaints.filter(c => c.category === 'management').length,
        cafeteria: orgComplaints.filter(c => c.category === 'cafeteria').length,
        security: orgComplaints.filter(c => c.category === 'security').length,
        other: orgComplaints.filter(c => c.category === 'other').length
      }
    };
  }

  // Feedback operations
  async getFeedback(id: number): Promise<Feedback | undefined> {
    return this.feedbacks.find(feedback => feedback.id === id);
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const feedback: Feedback = {
      id: this.nextId++,
      complaintId: insertFeedback.complaintId,
      userId: insertFeedback.userId,
      rating: insertFeedback.rating,
      comment: insertFeedback.comment || null,
      createdAt: new Date()
    };
    this.feedbacks.push(feedback);
    return feedback;
  }

  async getFeedbacksByComplaintId(complaintId: number): Promise<Feedback[]> {
    return this.feedbacks.filter(feedback => feedback.complaintId === complaintId);
  }

  // Notification operations
  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.find(notification => notification.id === id);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const notification: Notification = {
      id: this.nextId++,
      title: insertNotification.title,
      message: insertNotification.message,
      userId: insertNotification.userId || null,
      organizationId: insertNotification.organizationId,
      isRead: insertNotification.isRead || false,
      createdAt: new Date()
    };
    this.notifications.push(notification);
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.find(n => n.id === id);
    if (!notification) return undefined;

    notification.isRead = true;
    return notification;
  }

  async getNotificationsByUserId(userId: number): Promise<Notification[]> {
    return this.notifications.filter(notification => notification.userId === userId);
  }

  async getNotificationsByOrganizationId(organizationId: number): Promise<Notification[]> {
    return this.notifications.filter(notification => notification.organizationId === organizationId);
  }

  // User-Organization operations
  async getUserOrganizations(userId: number): Promise<any[]> {
    const userOrgRelations = this.userOrganizations.filter(uo => uo.userId === userId);
    const result = userOrgRelations.map(uo => {
      const org = this.organizations.find(o => o.id === uo.organizationId);
      if (!org) return null;

      return {
        id: org.id,
        name: org.name,
        description: org.description,
        accessKey: org.accessKey,
        thresholdPercentage: org.thresholdPercentage,
        createdAt: org.createdAt,
        role: uo.role,
        joinedAt: uo.joinedAt || uo.createdAt || new Date()
      };
    }).filter(Boolean);

    console.log(`getUserOrganizations for user ${userId}:`, result);
    return result;
  }

  async getUserRoleInOrganization(userId: number, organizationId: number): Promise<string> {
    const userOrg = this.userOrganizations.find(uo =>
      uo.userId === userId && uo.organizationId === organizationId
    );
    return userOrg?.role || 'member';
  }

  async addUserToOrganization(userId: number, organizationId: number, role: string): Promise<UserOrganization> {
    const existingIndex = this.userOrganizations.findIndex(
      uo => uo.userId === userId && uo.organizationId === organizationId
    );

    const userOrg: UserOrganization = {
      id: existingIndex >= 0 ? this.userOrganizations[existingIndex].id : this.nextUserOrgId++,
      userId,
      organizationId,
      role,
      joinedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (existingIndex >= 0) {
      // Update existing relationship
      this.userOrganizations[existingIndex] = userOrg;
    } else {
      // Create new relationship
      this.userOrganizations.push(userOrg);
    }

    console.log(`Added user ${userId} to organization ${organizationId} with role ${role}`);
    console.log('Current userOrganizations:', this.userOrganizations);
    return userOrg;
  }
}