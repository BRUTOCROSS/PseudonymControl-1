import type { Express } from "express";
import { createServer, type Server } from "http";
// Temporarily using memory storage due to database connectivity issues
// import { storage } from "./storage";
import { MemoryStorage } from "./memory-storage";
const storage = new MemoryStorage();
import session from "express-session";
import bcrypt from "bcryptjs";
import { insertUserSchema, insertOrganizationSchema, insertComplaintSchema, insertFeedbackSchema } from "@shared/schema";
import { categorizeComplaint } from "./services/gemini";
import { nanoid } from "nanoid";
import { z } from "zod";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || "fallback-secret-key-for-development",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      sameSite: 'lax'
    },
    name: 'pseudoresolve.sid'
  }));

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Generate pseudonym helper
  const generatePseudonym = () => {
    const adjectives = ['Anonymous', 'Secret', 'Hidden', 'Private', 'Quiet', 'Silent'];
    const nouns = ['User', 'Person', 'Individual', 'Employee', 'Worker', 'Staff'];
    const number = Math.floor(Math.random() * 1000);
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj}${noun}${number}`;
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password, organizationAccessKey } = req.body;
      
      // Validate input
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Check if user exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Get organization if access key provided
      let organizationId = null;
      let organization = null;
      if (organizationAccessKey) {
        organization = await storage.getOrganizationByAccessKey(organizationAccessKey);
        if (!organization) {
          return res.status(400).json({ message: "Invalid organization access key" });
        }
        organizationId = organization.id;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Generate pseudonym and access key
      const pseudonym = generatePseudonym();
      const accessKey = nanoid(16);

      // Create user
      const userData = {
        username,
        password: hashedPassword,
        pseudonym,
        accessKey,
        organizationId,
        isAdmin: false
      };

      const user = await storage.createUser(userData);
      req.session.userId = user.id;

      // If joining organization during registration, add user to organization
      if (organization) {
        await storage.addUserToOrganization(user.id, organization.id, 'member');
      }

      res.json({ 
        id: user.id, 
        username: user.username, 
        pseudonym: user.pseudonym,
        organizationId: user.organizationId,
        isAdmin: user.isAdmin
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;

      res.json({ 
        id: user.id, 
        username: user.username, 
        pseudonym: user.pseudonym,
        organizationId: user.organizationId,
        isAdmin: user.isAdmin
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie('connect.sid'); // Clear session cookie
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ 
        id: user.id, 
        username: user.username, 
        pseudonym: user.pseudonym,
        organizationId: user.organizationId,
        isAdmin: user.isAdmin
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Organization routes
  app.post("/api/organizations", requireAuth, async (req, res) => {
    try {
      console.log("Creating organization with user ID:", req.session.userId);
      console.log("Request body:", req.body);
      
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const requestData = req.body;
      requestData.accessKey = nanoid(12);
      
      // Validate the data
      const data = insertOrganizationSchema.parse(requestData);
      console.log("Parsed organization data:", data);
      
      const organization = await storage.createOrganization(data);
      console.log("Created organization:", organization);
      
      // Make the creator an admin in the user-organization relationship
      await storage.addUserToOrganization(req.session.userId!, organization.id, 'admin');
      
      // Update user's current organization
      await storage.updateUser(req.session.userId!, { 
        organizationId: organization.id,
        isAdmin: true 
      });

      res.json(organization);
    } catch (error) {
      console.error("Create organization error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid organization data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create organization" });
    }
  });

  app.get("/api/organizations", async (req, res) => {
    try {
      const organizations = await storage.getAllOrganizations();
      res.json(organizations);
    } catch (error) {
      console.error("Get organizations error:", error);
      res.status(500).json({ message: "Failed to fetch organizations" });
    }
  });

  app.post("/api/organizations/join", requireAuth, async (req, res) => {
    try {
      const { accessKey } = req.body;
      
      const organization = await storage.getOrganizationByAccessKey(accessKey);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      // Check if user is already a member
      const existingRole = await storage.getUserRoleInOrganization(req.session.userId!, organization.id);
      if (existingRole !== 'none') {
        return res.status(400).json({ message: "You are already a member of this organization" });
      }

      // Add user as a member to the organization
      await storage.addUserToOrganization(req.session.userId!, organization.id, 'member');

      // Update user's current organization
      await storage.updateUser(req.session.userId!, { 
        organizationId: organization.id,
        isAdmin: false
      });

      res.json(organization);
    } catch (error) {
      console.error("Join organization error:", error);
      res.status(500).json({ message: "Failed to join organization" });
    }
  });

  app.post("/api/organizations/switch", requireAuth, async (req, res) => {
    try {
      const { organizationId } = req.body;
      
      // Verify user has access to this organization
      const organization = await storage.getOrganization(organizationId);
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      // Get user's role in the organization
      const userRole = await storage.getUserRoleInOrganization(req.session.userId!, organizationId);
      if (userRole === 'none') {
        return res.status(403).json({ message: "You don't have access to this organization" });
      }

      // Update user's current organization and admin status based on role
      await storage.updateUser(req.session.userId!, { 
        organizationId: organizationId,
        isAdmin: userRole === 'admin'
      });

      res.json({ 
        message: "Organization switched successfully",
        organization: {
          ...organization,
          role: userRole
        }
      });
    } catch (error) {
      console.error("Switch organization error:", error);
      res.status(500).json({ message: "Failed to switch organization" });
    }
  });

  app.get("/api/user/organizations", requireAuth, async (req, res) => {
    try {
      // Return only organizations the user is a member of
      const userOrganizations = await storage.getUserOrganizations(req.session.userId!);
      console.log(`Fetched user organizations for user ${req.session.userId}:`, userOrganizations);
      res.json(userOrganizations);
    } catch (error) {
      console.error("Get user organizations error:", error);
      res.status(500).json({ message: "Failed to fetch user organizations" });
    }
  });

  // Complaint routes
  app.post("/api/complaints", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user || !user.organizationId) {
        return res.status(400).json({ message: "Must be part of an organization to submit complaints" });
      }

      const { content, category } = req.body;
      
      // Use Gemini AI for categorization if no category provided
      let finalCategory = category;
      let similarityGroup = '';
      
      if (!category) {
        try {
          const aiResult = await categorizeComplaint(content);
          finalCategory = aiResult.category;
          similarityGroup = aiResult.similarityGroup;
        } catch (error) {
          console.error("AI categorization failed:", error);
          // Fallback to 'other' category
          finalCategory = 'other';
          similarityGroup = 'general-concerns';
        }
      }

      const complaintData = {
        content,
        category: finalCategory,
        similarityGroup,
        userId: user.id,
        organizationId: user.organizationId,
        status: 'pending' as const,
        escalated: false
      };

      const complaint = await storage.createComplaint(complaintData);

      // Check if this group should be escalated based on threshold
      const organization = await storage.getOrganization(user.organizationId);
      const threshold = organization?.thresholdPercentage || 15;
      
      // Get all complaints for this organization to calculate percentage
      const orgComplaints = await storage.getComplaintsByOrganizationId(user.organizationId);
      
      // Filter out complaints from admin users for threshold calculation
      const orgUsers = await storage.getUsersByOrganizationId(user.organizationId);
      const nonAdminUserIds = orgUsers.filter(u => !u.isAdmin).map(u => u.id);
      const nonAdminComplaints = orgComplaints.filter(c => nonAdminUserIds.includes(c.userId));
      
      const similarComplaints = nonAdminComplaints.filter(c => c.similarityGroup === similarityGroup);
      const groupPercentage = nonAdminComplaints.length > 0 ? (similarComplaints.length / nonAdminComplaints.length) * 100 : 0;
      
      // Auto-escalate if threshold is reached
      if (groupPercentage >= threshold) {
        // Escalate all pending complaints in this similarity group
        for (const similarComplaint of similarComplaints.filter(c => c.status === 'pending')) {
          await storage.updateComplaintStatus(similarComplaint.id, 'escalated');
        }
      }

      // Create notification for admins
      const admins = await storage.getUsersByOrganizationId(user.organizationId);
      const notificationTitle = groupPercentage >= threshold 
        ? "URGENT: Complaint Group Auto-Escalated" 
        : "New Complaint Submitted";
      const notificationMessage = groupPercentage >= threshold
        ? `${similarComplaints.length} complaints about "${similarityGroup}" have been auto-escalated (${groupPercentage.toFixed(1)}% of total complaints)`
        : `A new ${finalCategory} complaint has been submitted`;

      for (const admin of admins.filter(u => u.isAdmin)) {
        await storage.createNotification({
          title: notificationTitle,
          message: notificationMessage,
          userId: admin.id,
          organizationId: user.organizationId
        });
      }

      res.json(complaint);
    } catch (error) {
      console.error("Create complaint error:", error);
      res.status(500).json({ message: "Failed to submit complaint" });
    }
  });

  app.get("/api/complaints", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let complaints;
      if (user.isAdmin && user.organizationId) {
        // Admin sees all organization complaints
        complaints = await storage.getComplaintsByOrganizationId(user.organizationId);
      } else {
        // Regular user sees only their complaints
        complaints = await storage.getComplaintsByUserId(user.id);
      }

      res.json(complaints);
    } catch (error) {
      console.error("Get complaints error:", error);
      res.status(500).json({ message: "Failed to fetch complaints" });
    }
  });

  app.patch("/api/complaints/:id/status", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { status } = req.body;
      const complaintId = parseInt(req.params.id);
      
      const complaint = await storage.updateComplaintStatus(complaintId, status);
      if (!complaint) {
        return res.status(404).json({ message: "Complaint not found" });
      }

      // Create notification for user
      await storage.createNotification({
        title: "Complaint Status Updated",
        message: `Your complaint has been ${status}`,
        userId: complaint.userId,
        organizationId: complaint.organizationId
      });

      res.json(complaint);
    } catch (error) {
      console.error("Update complaint status error:", error);
      res.status(500).json({ message: "Failed to update complaint status" });
    }
  });

  app.get("/api/complaints/stats", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user?.organizationId) {
        return res.status(400).json({ message: "Must be part of an organization" });
      }

      const stats = await storage.getComplaintStats(user.organizationId);
      res.json(stats);
    } catch (error) {
      console.error("Get complaint stats error:", error);
      res.status(500).json({ message: "Failed to fetch complaint statistics" });
    }
  });

  // Grouped complaints endpoint for admin dashboard
  app.get("/api/complaints/grouped", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user?.isAdmin || !user.organizationId) {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Get all complaints for the organization
      const complaints = await storage.getComplaintsByOrganizationId(user.organizationId);
      
      // Filter out complaints from admin users for threshold calculation
      const orgUsers = await storage.getUsersByOrganizationId(user.organizationId);
      const nonAdminUserIds = orgUsers.filter(u => !u.isAdmin).map(u => u.id);
      const nonAdminComplaints = complaints.filter(c => nonAdminUserIds.includes(c.userId));
      
      // Group all complaints by similarityGroup (including admin complaints for display)
      const groupedComplaints = complaints.reduce((groups: any, complaint: any) => {
        const group = complaint.similarityGroup || 'general-concerns';
        if (!groups[group]) {
          groups[group] = [];
        }
        groups[group].push(complaint);
        return groups;
      }, {});

      // Get organization threshold
      const organization = await storage.getOrganization(user.organizationId);
      const threshold = organization?.thresholdPercentage || 15;
      const totalComplaints = nonAdminComplaints.length; // Use non-admin complaints for threshold calculation

      // Create summaries for each group and check thresholds
      const { summarizeComplaintGroup } = await import("./services/gemini");
      const groupSummaries = [];

      for (const [similarityGroup, groupComplaints] of Object.entries(groupedComplaints)) {
        const complaintsArray = groupComplaints as any[];
        // Calculate percentage based on non-admin complaints only
        const nonAdminGroupComplaints = complaintsArray.filter(c => nonAdminUserIds.includes(c.userId));
        const groupPercentage = totalComplaints > 0 ? (nonAdminGroupComplaints.length / totalComplaints) * 100 : 0;
        const shouldEscalate = groupPercentage >= threshold && complaintsArray.some(c => c.status === 'pending');

        // Generate AI summary for this group
        let aiSummary = null;
        try {
          aiSummary = await summarizeComplaintGroup(complaintsArray, similarityGroup);
        } catch (error) {
          console.error(`Failed to summarize group ${similarityGroup}:`, error);
        }

        groupSummaries.push({
          similarityGroup,
          complaints: complaintsArray,
          count: complaintsArray.length,
          percentage: Math.round(groupPercentage * 10) / 10,
          shouldEscalate,
          exceedsThreshold: groupPercentage >= threshold,
          aiSummary,
          latestComplaint: complaintsArray.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0]
        });
      }

      // Sort groups by urgency and percentage
      groupSummaries.sort((a, b) => {
        if (a.shouldEscalate !== b.shouldEscalate) {
          return a.shouldEscalate ? -1 : 1;
        }
        return b.percentage - a.percentage;
      });

      res.json({
        groups: groupSummaries,
        threshold,
        totalComplaints,
        escalationGroups: groupSummaries.filter(g => g.shouldEscalate).length
      });
    } catch (error) {
      console.error("Get grouped complaints error:", error);
      res.status(500).json({ message: "Failed to fetch grouped complaints" });
    }
  });

  // Feedback routes
  app.post("/api/feedback", requireAuth, async (req, res) => {
    try {
      const data = insertFeedbackSchema.parse(req.body);
      data.userId = req.session.userId!;
      
      const feedback = await storage.createFeedback(data);
      res.json(feedback);
    } catch (error) {
      console.error("Create feedback error:", error);
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  // Notification routes
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const notifications = await storage.getNotificationsByUserId(req.session.userId!);
      res.json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", requireAuth, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const notification = await storage.markNotificationAsRead(notificationId);
      res.json(notification);
    } catch (error) {
      console.error("Mark notification read error:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Organization threshold update endpoint (admin only)
  app.patch("/api/organizations/:id", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const organizationId = parseInt(req.params.id);
      const { thresholdPercentage } = req.body;

      // Validate threshold percentage
      if (!thresholdPercentage || thresholdPercentage < 1 || thresholdPercentage > 100) {
        return res.status(400).json({ message: "Threshold percentage must be between 1 and 100" });
      }

      // Check if user has admin role in this specific organization
      const userRole = await storage.getUserRoleInOrganization(user.id, organizationId);
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Update the organization threshold
      const organization = await storage.updateOrganization(organizationId, { thresholdPercentage });
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }

      // Create notification for all organization members about threshold change
      const orgUsers = await storage.getUsersByOrganizationId(organizationId);
      for (const orgUser of orgUsers) {
        await storage.createNotification({
          title: "Escalation Threshold Updated",
          message: `The complaint escalation threshold has been updated to ${thresholdPercentage}%`,
          userId: orgUser.id,
          organizationId: organizationId
        });
      }

      res.json(organization);
    } catch (error) {
      console.error("Update organization threshold error:", error);
      res.status(500).json({ message: "Failed to update threshold" });
    }
  });

  // Chat endpoint with complaint submission capability
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, chatHistory = [] } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Check if user is authenticated for complaint submission
      const isAuthenticated = !!req.session.userId;
      let user = null;
      
      if (isAuthenticated) {
        user = await storage.getUser(req.session.userId!);
      }

      // Import functions from gemini service
      const { getChatResponse, isComplaintSubmission, categorizeComplaint } = await import("./services/gemini");
      
      // Check if this message is a complaint submission
      if (isAuthenticated && user && user.organizationId && isComplaintSubmission(message)) {
        // This is a complaint - create it in the database
        try {
          let finalCategory = 'other';
          let similarityGroup = 'general-concerns';
          
          try {
            const aiResult = await categorizeComplaint(message);
            finalCategory = aiResult.category;
            similarityGroup = aiResult.similarityGroup;
          } catch (error) {
            console.error("AI categorization failed:", error);
          }

          const complaintData = {
            content: message,
            category: finalCategory,
            similarityGroup,
            userId: user.id,
            organizationId: user.organizationId,
            status: 'pending' as const,
            escalated: false
          };

          const complaint = await storage.createComplaint(complaintData);

          // Create notification for admins
          const admins = await storage.getUsersByOrganizationId(user.organizationId);
          for (const admin of admins.filter(u => u.isAdmin)) {
            await storage.createNotification({
              title: "New Complaint Submitted",
              message: `A new ${finalCategory} complaint has been submitted`,
              userId: admin.id,
              organizationId: user.organizationId
            });
          }

          // Return complaint confirmation
          const response = `Thank you! Your complaint has been successfully lodged and submitted anonymously. 

**Complaint Details:**
- **Category:** ${finalCategory}
- **Status:** Pending review
- **Complaint ID:** #${complaint.id}

Your complaint will be reviewed by the appropriate administrators. You'll receive notifications about any status updates. You can also check the status anytime in the 'My Complaints' section of your dashboard.

Is there anything else I can help you with regarding this complaint or the process?`;
          
          return res.json({ response, complaintSubmitted: true, complaintId: complaint.id });
          
        } catch (error) {
          console.error("Failed to create complaint via chat:", error);
          const response = "I apologize, but there was an issue submitting your complaint. Please try using the complaint form instead, or contact support if the problem persists.";
          return res.json({ response });
        }
      }

      // Regular chat response (not a complaint)
      const response = await getChatResponse(message, chatHistory);
      
      res.json({ response });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Failed to get chat response" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
