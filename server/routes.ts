import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import type { User, PaymentGateway } from "@shared/schema";
import { insertUserSchema, updateUserSchema, insertPaymentGatewaySchema, updatePaymentGatewaySchema, insertCollaboratorSchema, updateCollaboratorSchema, insertWhatsappInstanceSchema, updateWhatsappInstanceSchema, insertPriceTableSchema, updatePriceTableSchema, insertCustomerPlanSchema, updateCustomerPlanSchema } from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";

// Simple auth middleware for demo purposes
const requireAuth = (req: any, res: any, next: any) => {
  // For demo, we'll use a simple user ID from session or header
  const userId = req.headers['x-user-id'] || '2'; // Default to Sarah Johnson for demo
  req.userId = parseInt(userId);
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // In a real app, you would verify the hashed password
      // For now, we'll check if password matches the stored password
      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    try {
      // In a real app, you would invalidate the session/token
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Utility routes for mock data generation
  app.post("/api/utils/bcrypt", async (req, res) => {
    try {
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }

      const saltRounds = 10;
      const hash = await bcrypt.hash(password, saltRounds);
      
      res.json({ hash });
    } catch (error) {
      console.error("Error generating bcrypt hash:", error);
      res.status(500).json({ message: "Failed to generate bcrypt hash" });
    }
  });

  // Users CRUD routes
  app.get("/api/users", async (req, res) => {
    try {
      const userRole = req.query.role as string;
      const entrepreneurId = req.query.entrepreneurId ? parseInt(req.query.entrepreneurId as string) : undefined;
      
      let users: any[];
      if (userRole === 'super-admin') {
        // Super admin sees all users
        users = await storage.getAllUsers();
      } else if ((userRole === 'entrepreneur' || userRole === 'collaborator') && entrepreneurId) {
        // Entrepreneur and collaborators see their entrepreneur's users
        users = await storage.getAllUsers(entrepreneurId);
      } else {
        users = [];
      }
      
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateUserSchema.parse(req.body);
      const user = await storage.updateUser(id, validatedData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteUser(id);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Payment Gateways CRUD routes
  app.get("/api/payment-gateways", async (req, res) => {
    try {
      const userRole = req.query.role as string;
      const entrepreneurId = req.query.entrepreneurId ? parseInt(req.query.entrepreneurId as string) : undefined;
      
      let gateways: any[];
      if (userRole === 'super-admin') {
        // Super admin sees all payment gateways
        gateways = await storage.getAllPaymentGateways();
      } else if ((userRole === 'entrepreneur' || userRole === 'collaborator') && entrepreneurId) {
        // Entrepreneur and collaborators see their entrepreneur's gateways
        gateways = await storage.getAllPaymentGateways(entrepreneurId);
      } else {
        gateways = [];
      }
      
      res.json(gateways);
    } catch (error) {
      console.error("Error fetching payment gateways:", error);
      res.status(500).json({ message: "Failed to fetch payment gateways" });
    }
  });

  app.get("/api/payment-gateways/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const gateway = await storage.getPaymentGateway(id);
      if (!gateway) {
        return res.status(404).json({ message: "Payment gateway not found" });
      }
      res.json(gateway);
    } catch (error) {
      console.error("Error fetching payment gateway:", error);
      res.status(500).json({ message: "Failed to fetch payment gateway" });
    }
  });

  app.post("/api/payment-gateways", async (req, res) => {
    try {
      const validatedData = insertPaymentGatewaySchema.parse(req.body);
      const entrepreneurId = req.body.entrepreneurId || 2; // Default to entrepreneur ID 2
      const gateway = await storage.createPaymentGateway({ 
        ...validatedData, 
        createdBy: 1, 
        entrepreneurId: entrepreneurId 
      });
      res.status(201).json(gateway);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating payment gateway:", error);
      res.status(500).json({ message: "Failed to create payment gateway" });
    }
  });

  app.put("/api/payment-gateways/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updatePaymentGatewaySchema.parse(req.body);
      const gateway = await storage.updatePaymentGateway(id, validatedData);
      if (!gateway) {
        return res.status(404).json({ message: "Payment gateway not found" });
      }
      res.json(gateway);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating payment gateway:", error);
      res.status(500).json({ message: "Failed to update payment gateway" });
    }
  });

  app.delete("/api/payment-gateways/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePaymentGateway(id);
      if (!success) {
        return res.status(404).json({ message: "Payment gateway not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting payment gateway:", error);
      res.status(500).json({ message: "Failed to delete payment gateway" });
    }
  });

  // Collaborators CRUD routes
  app.get("/api/collaborators", async (req, res) => {
    try {
      const entrepreneurId = req.query.entrepreneurId;
      let collaborators;
      
      if (entrepreneurId) {
        collaborators = await storage.getCollaboratorsByEntrepreneur(parseInt(entrepreneurId as string));
      } else {
        collaborators = await storage.getAllCollaborators();
      }
      
      res.json(collaborators);
    } catch (error) {
      console.error("Error fetching collaborators:", error);
      res.status(500).json({ message: "Failed to fetch collaborators" });
    }
  });

  app.get("/api/collaborators/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const collaborator = await storage.getCollaborator(id);
      if (!collaborator) {
        return res.status(404).json({ message: "Collaborator not found" });
      }
      res.json(collaborator);
    } catch (error) {
      console.error("Error fetching collaborator:", error);
      res.status(500).json({ message: "Failed to fetch collaborator" });
    }
  });

  app.post("/api/collaborators", async (req, res) => {
    try {
      const validatedData = insertCollaboratorSchema.parse(req.body);
      // For now, using entrepreneur ID 2 - in real implementation, this would come from authentication
      const collaborator = await storage.createCollaborator({ ...validatedData, entrepreneurId: 2 });
      res.status(201).json(collaborator);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating collaborator:", error);
      res.status(500).json({ message: "Failed to create collaborator" });
    }
  });

  app.put("/api/collaborators/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateCollaboratorSchema.parse(req.body);
      const collaborator = await storage.updateCollaborator(id, validatedData);
      if (!collaborator) {
        return res.status(404).json({ message: "Collaborator not found" });
      }
      res.json(collaborator);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating collaborator:", error);
      res.status(500).json({ message: "Failed to update collaborator" });
    }
  });

  app.delete("/api/collaborators/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCollaborator(id);
      if (!success) {
        return res.status(404).json({ message: "Collaborator not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting collaborator:", error);
      res.status(500).json({ message: "Failed to delete collaborator" });
    }
  });

  // WhatsApp Instances routes
  app.get("/api/whatsapp-instances", requireAuth, async (req: any, res) => {
    try {
      const userId = req.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let instances;
      if (user.role === 'super-admin') {
        instances = await storage.getAllWhatsappInstances();
      } else if (user.role === 'entrepreneur') {
        instances = await storage.getAllWhatsappInstances(user.id);
      } else {
        instances = await storage.getAllWhatsappInstances(user.entrepreneurId!);
      }
      
      res.json(instances);
    } catch (error) {
      console.error("Error fetching WhatsApp instances:", error);
      res.status(500).json({ message: "Failed to fetch WhatsApp instances" });
    }
  });

  app.get("/api/whatsapp-instances/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const instance = await storage.getWhatsappInstance(id);
      if (!instance) {
        return res.status(404).json({ message: "WhatsApp instance not found" });
      }
      res.json(instance);
    } catch (error) {
      console.error("Error fetching WhatsApp instance:", error);
      res.status(500).json({ message: "Failed to fetch WhatsApp instance" });
    }
  });

  app.post("/api/whatsapp-instances", requireAuth, async (req: any, res) => {
    try {
      const userId = req.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const validatedData = insertWhatsappInstanceSchema.parse(req.body);
      
      const entrepreneurId = user.role === 'entrepreneur' ? user.id : user.entrepreneurId!;
      
      const instance = await storage.createWhatsappInstance({
        ...validatedData,
        createdBy: user.id,
        entrepreneurId: entrepreneurId,
      });
      
      res.status(201).json(instance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating WhatsApp instance:", error);
      res.status(500).json({ message: "Failed to create WhatsApp instance" });
    }
  });

  app.put("/api/whatsapp-instances/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateWhatsappInstanceSchema.parse(req.body);
      
      const instance = await storage.updateWhatsappInstance(id, validatedData);
      if (!instance) {
        return res.status(404).json({ message: "WhatsApp instance not found" });
      }
      
      res.json(instance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating WhatsApp instance:", error);
      res.status(500).json({ message: "Failed to update WhatsApp instance" });
    }
  });

  app.delete("/api/whatsapp-instances/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteWhatsappInstance(id);
      if (!success) {
        return res.status(404).json({ message: "WhatsApp instance not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting WhatsApp instance:", error);
      res.status(500).json({ message: "Failed to delete WhatsApp instance" });
    }
  });

  // QR Code generation endpoint
  app.post("/api/whatsapp-instances/:id/qrcode", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const instance = await storage.getWhatsappInstance(id);
      
      if (!instance) {
        return res.status(404).json({ message: "WhatsApp instance not found" });
      }

      // Make request to external API to get QR code
      const qrResponse = await fetch(`${instance.apiUrl}/qrcode/${instance.instanceNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!qrResponse.ok) {
        throw new Error(`QR API responded with status: ${qrResponse.status}`);
      }

      const qrData = await qrResponse.json();
      res.json(qrData);
    } catch (error) {
      console.error("Error generating QR code:", error);
      res.status(500).json({ message: "Failed to generate QR code" });
    }
  });

  // Price Table routes - Super admin only for CRUD, public access for display
  app.get("/api/price-tables", async (req, res) => {
    try {
      const priceTables = await storage.getAllPriceTables();
      res.json(priceTables);
    } catch (error) {
      console.error("Error fetching price tables:", error);
      res.status(500).json({ message: "Failed to fetch price tables" });
    }
  });

  app.get("/api/price-tables/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const priceTable = await storage.getPriceTable(id);
      if (!priceTable) {
        return res.status(404).json({ message: "Price table not found" });
      }
      res.json(priceTable);
    } catch (error) {
      console.error("Error fetching price table:", error);
      res.status(500).json({ message: "Failed to fetch price table" });
    }
  });

  // Super admin only routes
  const requireSuperAdmin = async (req: any, res: any, next: any) => {
    const userId = req.headers['x-user-id'] || '1'; // Default to Admin for demo
    const user = await storage.getUser(parseInt(userId));
    
    if (!user || user.role !== 'super-admin') {
      return res.status(403).json({ message: "Access denied. Super admin role required." });
    }
    
    req.userId = user.id;
    next();
  };

  app.post("/api/price-tables", requireSuperAdmin, async (req, res) => {
    try {
      const validatedData = insertPriceTableSchema.parse(req.body);
      const priceTable = await storage.createPriceTable(validatedData);
      res.status(201).json(priceTable);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating price table:", error);
      res.status(500).json({ message: "Failed to create price table" });
    }
  });

  app.put("/api/price-tables/:id", requireSuperAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updatePriceTableSchema.parse(req.body);
      
      const priceTable = await storage.updatePriceTable(id, validatedData);
      if (!priceTable) {
        return res.status(404).json({ message: "Price table not found" });
      }
      
      res.json(priceTable);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating price table:", error);
      res.status(500).json({ message: "Failed to update price table" });
    }
  });

  app.delete("/api/price-tables/:id", requireSuperAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePriceTable(id);
      if (!success) {
        return res.status(404).json({ message: "Price table not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting price table:", error);
      res.status(500).json({ message: "Failed to delete price table" });
    }
  });

  // Customer Plans routes
  app.get("/api/customer-plans", requireAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let customerPlans;
      
      // Super admin sees all plans, customers see their own plans
      if (user.role === 'super-admin') {
        customerPlans = await storage.getAllCustomerPlans();
      } else {
        customerPlans = await storage.getCustomerPlansByCustomer(user.id);
      }
      
      res.json(customerPlans);
    } catch (error) {
      console.error("Error fetching customer plans:", error);
      res.status(500).json({ message: "Failed to fetch customer plans" });
    }
  });

  app.get("/api/customer-plans/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const plan = await storage.getCustomerPlan(id);
      
      if (!plan) {
        return res.status(404).json({ message: "Customer plan not found" });
      }
      
      // Check access permissions
      const userId = req.userId;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'super-admin' && 
          plan.customerId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(plan);
    } catch (error) {
      console.error("Error fetching customer plan:", error);
      res.status(500).json({ message: "Failed to fetch customer plan" });
    }
  });

  app.post("/api/customer-plans", requireAuth, async (req, res) => {
    try {
      const validatedData = insertCustomerPlanSchema.parse(req.body);
      const plan = await storage.createCustomerPlan(validatedData);
      res.status(201).json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating customer plan:", error);
      res.status(500).json({ message: "Failed to create customer plan" });
    }
  });

  app.put("/api/customer-plans/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateCustomerPlanSchema.parse(req.body);
      
      // Check if plan exists and user has permission
      const existingPlan = await storage.getCustomerPlan(id);
      if (!existingPlan) {
        return res.status(404).json({ message: "Customer plan not found" });
      }
      
      const userId = req.userId;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'super-admin' && 
          existingPlan.entrepreneurId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const plan = await storage.updateCustomerPlan(id, validatedData);
      if (!plan) {
        return res.status(404).json({ message: "Customer plan not found" });
      }
      
      res.json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating customer plan:", error);
      res.status(500).json({ message: "Failed to update customer plan" });
    }
  });

  app.delete("/api/customer-plans/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if plan exists and user has permission
      const existingPlan = await storage.getCustomerPlan(id);
      if (!existingPlan) {
        return res.status(404).json({ message: "Customer plan not found" });
      }
      
      const userId = req.userId;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'super-admin' && 
          existingPlan.entrepreneurId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const success = await storage.deleteCustomerPlan(id);
      if (!success) {
        return res.status(404).json({ message: "Customer plan not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting customer plan:", error);
      res.status(500).json({ message: "Failed to delete customer plan" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
