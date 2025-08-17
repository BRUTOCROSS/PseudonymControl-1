import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import bcrypt from "bcryptjs";
import { insertUserSchema, insertOrganizationSchema, insertComplaintSchema, insertFeedbackSchema } from "@shared/schema";
import { categorizeComplaint } from "./services/gemini";
import { nanoid } from "nanoid";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || "fallback-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
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
      if (organizationAccessKey) {
        const organization = await storage.getOrganizationByAccessKey(organizationAccessKey);
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
    req.session.destroy(() => {
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
  app.post("/api/organizations", async (req, res) => {
    try {
      const requestData = req.body;
      requestData.accessKey = nanoid(12);
      const data = insertOrganizationSchema.parse(requestData);
      
      const organization = await storage.createOrganization(data);
      
      // If user is logged in, make them admin of this organization
      if (req.session.userId) {
        await storage.updateUser(req.session.userId, { 
          organizationId: organization.id,
          isAdmin: true 
        });
      }

      res.json(organization);
    } catch (error) {
      console.error("Create organization error:", error);
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

      await storage.updateUser(req.session.userId!, { 
        organizationId: organization.id 
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

      // Update user's current organization
      await storage.updateUser(req.session.userId!, { 
        organizationId: organization.id 
      });

      res.json({ message: "Organization switched successfully" });
    } catch (error) {
      console.error("Switch organization error:", error);
      res.status(500).json({ message: "Failed to switch organization" });
    }
  });

  app.get("/api/user/organizations", requireAuth, async (req, res) => {
    try {
      // For now, return all organizations (you might want to implement user-organization relationships)
      const organizations = await storage.getAllOrganizations();
      res.json(organizations);
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

  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, chatHistory = [] } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Import getChatResponse from gemini service
      const { getChatResponse } = await import("./services/gemini");
      
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
