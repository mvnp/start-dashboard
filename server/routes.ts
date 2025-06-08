import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { login, verifyToken, refreshToken, logout, logoutFromAllDevices, authenticateToken, authorize, authorizeEntrepreneurOrAdmin, authorizeResourceOwner } from "./auth";
import type { User, PaymentGateway } from "@shared/schema";
import { insertUserSchema, updateUserSchema, insertPaymentGatewaySchema, updatePaymentGatewaySchema, insertCollaboratorSchema, updateCollaboratorSchema, insertWhatsappInstanceSchema, updateWhatsappInstanceSchema, insertPriceTableSchema, updatePriceTableSchema, insertCustomerPlanSchema, updateCustomerPlanSchema, insertSupportTicketSchema, insertAccountingSchema, updateAccountingSchema } from "@shared/schema";
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
  
  // Authentication routes with Swagger documentation
  app.post("/api/auth/login", login);
  app.get("/api/auth/verify", authenticateToken, verifyToken);
  app.post("/api/auth/refresh", refreshToken);
  app.post("/api/auth/logout", logout);
  app.post("/api/auth/logout-all", authenticateToken, logoutFromAllDevices);

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

  /**
   * @swagger
   * /api/users:
   *   get:
   *     tags: [Users]
   *     summary: Get all users
   *     description: Retrieve all users based on role and permissions
   *     parameters:
   *       - in: query
   *         name: role
   *         schema:
   *           type: string
   *           enum: [super-admin, entrepreneur, collaborator, customer]
   *         description: User role for filtering
   *       - in: query
   *         name: entrepreneurId
   *         schema:
   *           type: integer
   *         description: Entrepreneur ID for filtering users
   *     responses:
   *       200:
   *         description: List of users
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/User'
   *       500:
   *         description: Internal server error
   */
  app.get("/api/users", authenticateToken, async (req, res) => {
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
        // If no specific role/entrepreneurId is provided, return all users for component usage
        users = await storage.getAllUsers();
      }
      
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  /**
   * @swagger
   * /api/users/{id}:
   *   get:
   *     tags: [Users]
   *     summary: Get user by ID
   *     description: Retrieve a specific user by their ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: User ID
   *     responses:
   *       200:
   *         description: User details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
  app.get("/api/users/:id", authenticateToken, async (req, res) => {
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

  /**
   * @swagger
   * /api/users:
   *   post:
   *     tags: [Users]
   *     summary: Create a new user
   *     description: Create a new user with the provided information
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateUser'
   *     responses:
   *       201:
   *         description: User created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       400:
   *         description: Invalid data
   *       500:
   *         description: Internal server error
   */
  app.post("/api/users", authenticateToken, authorize(['super-admin', 'entrepreneur']), async (req, res) => {
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

  /**
   * @swagger
   * /api/collaborators:
   *   get:
   *     tags: [Collaborators]
   *     summary: Get all collaborators
   *     description: Retrieve collaborators based on user role and permissions. Entrepreneurs see their collaborators, super-admins see all.
   *     parameters:
   *       - in: query
   *         name: entrepreneurId
   *         schema:
   *           type: integer
   *         description: Filter collaborators by entrepreneur ID
   *     responses:
   *       200:
   *         description: List of collaborators
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Collaborator'
   *       401:
   *         description: Authentication required
   *       403:
   *         description: Insufficient permissions
   *       500:
   *         description: Internal server error
   */
  app.get("/api/collaborators", authenticateToken, authorizeEntrepreneurOrAdmin, async (req, res) => {
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

  /**
   * @swagger
   * /api/collaborators/{id}:
   *   get:
   *     tags: [Collaborators]
   *     summary: Get collaborator by ID
   *     description: Retrieve a specific collaborator by their ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Collaborator ID
   *     responses:
   *       200:
   *         description: Collaborator details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Collaborator'
   *       401:
   *         description: Authentication required
   *       403:
   *         description: Insufficient permissions
   *       404:
   *         description: Collaborator not found
   *       500:
   *         description: Internal server error
   */
  app.get("/api/collaborators/:id", authenticateToken, authorizeEntrepreneurOrAdmin, async (req, res) => {
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

  /**
   * @swagger
   * /api/collaborators:
   *   post:
   *     tags: [Collaborators]
   *     summary: Create a new collaborator
   *     description: Create a new collaborator under the authenticated entrepreneur
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateCollaborator'
   *     responses:
   *       201:
   *         description: Collaborator created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Collaborator'
   *       400:
   *         description: Invalid data
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 errors:
   *                   type: array
   *                   items:
   *                     type: object
   *       401:
   *         description: Authentication required
   *       403:
   *         description: Insufficient permissions
   *       500:
   *         description: Internal server error
   */
  app.post("/api/collaborators", authenticateToken, authorize(['entrepreneur', 'super-admin']), async (req, res) => {
    try {
      const validatedData = insertCollaboratorSchema.parse(req.body);
      // Get entrepreneur ID from authenticated user or request data
      const entrepreneurId = req.user?.role === 'super-admin' 
        ? (validatedData.entrepreneurId || req.user.entrepreneurId || 2) 
        : (req.user?.entrepreneurId || 2);
      
      const collaborator = await storage.createCollaborator({ 
        ...validatedData, 
        entrepreneurId 
      });
      res.status(201).json(collaborator);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating collaborator:", error);
      res.status(500).json({ message: "Failed to create collaborator" });
    }
  });

  /**
   * @swagger
   * /api/collaborators/{id}:
   *   put:
   *     tags: [Collaborators]
   *     summary: Update collaborator
   *     description: Update an existing collaborator's information
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Collaborator ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 example: "Jane Smith"
   *               email:
   *                 type: string
   *                 example: "jane.smith@example.com"
   *               role:
   *                 type: string
   *                 example: "Senior Developer"
   *               department:
   *                 type: string
   *                 example: "Engineering"
   *               phone:
   *                 type: string
   *                 example: "+1234567890"
   *               skills:
   *                 type: string
   *                 example: "React, Node.js, TypeScript"
   *               hireDate:
   *                 type: string
   *                 format: date
   *               isActive:
   *                 type: boolean
   *                 default: true
   *     responses:
   *       200:
   *         description: Collaborator updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Collaborator'
   *       400:
   *         description: Invalid data
   *       401:
   *         description: Authentication required
   *       403:
   *         description: Insufficient permissions
   *       404:
   *         description: Collaborator not found
   *       500:
   *         description: Internal server error
   */
  app.put("/api/collaborators/:id", authenticateToken, authorize(['entrepreneur', 'super-admin']), async (req, res) => {
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

  /**
   * @swagger
   * /api/collaborators/{id}:
   *   delete:
   *     tags: [Collaborators]
   *     summary: Delete collaborator
   *     description: Delete a collaborator by ID. Only entrepreneurs and super-admins can delete collaborators.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Collaborator ID
   *     responses:
   *       204:
   *         description: Collaborator deleted successfully
   *       401:
   *         description: Authentication required
   *       403:
   *         description: Insufficient permissions
   *       404:
   *         description: Collaborator not found
   *       500:
   *         description: Internal server error
   */
  app.delete("/api/collaborators/:id", authenticateToken, authorize(['entrepreneur', 'super-admin']), async (req, res) => {
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
      const userId = req.userId!;
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
      const userId = req.userId!;
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
          existingPlan.customerId !== userId) {
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
          existingPlan.customerId !== userId) {
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

  // Support tickets endpoint
  app.post("/api/support-tickets", async (req, res) => {
    try {
      const validatedData = insertSupportTicketSchema.parse(req.body);
      const ticket = await storage.createSupportTicket(validatedData);
      
      console.log(`Support ticket created: ${ticket.ticketId}`);
      
      res.status(201).json({
        success: true,
        ticketId: ticket.ticketId,
        message: "Support ticket submitted successfully",
        estimatedResponse: "24 hours",
        ticket
      });
    } catch (error) {
      console.error("Error creating support ticket:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to submit support ticket" 
      });
    }
  });

  app.get("/api/support-tickets", async (req, res) => {
    try {
      const tickets = await storage.getAllSupportTickets();
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
      res.status(500).json({ message: "Failed to fetch support tickets" });
    }
  });

  app.patch("/api/support-tickets/:id", async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const updateData = { ...req.body };
      
      // Convert string dates to Date objects
      if (updateData.resolvedAt) {
        updateData.resolvedAt = new Date(updateData.resolvedAt);
      }
      
      const updatedTicket = await storage.updateSupportTicket(ticketId, updateData);
      
      if (!updatedTicket) {
        return res.status(404).json({ message: "Support ticket not found" });
      }

      res.json(updatedTicket);
    } catch (error) {
      console.error("Error updating support ticket:", error);
      res.status(500).json({ message: "Failed to update support ticket" });
    }
  });

  // Accounting CRUD routes
  /**
   * @swagger
   * /api/accounting:
   *   get:
   *     tags: [Accounting]
   *     summary: Get all accounting entries
   *     description: Retrieve accounting entries for the authenticated entrepreneur. Super-admins can filter by entrepreneurId.
   *     parameters:
   *       - in: query
   *         name: entrepreneurId
   *         schema:
   *           type: integer
   *         description: Filter entries by entrepreneur ID (super-admin only)
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [receives, expenses]
   *         description: Filter by entry type
   *       - in: query
   *         name: category
   *         schema:
   *           type: string
   *         description: Filter by category
   *     responses:
   *       200:
   *         description: List of accounting entries
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Accounting'
   *       401:
   *         description: Authentication required
   *       500:
   *         description: Internal server error
   */
  app.get("/api/accounting", requireAuth, async (req, res) => {
    try {
      const entrepreneurId = parseInt(req.query.entrepreneurId as string) || req.userId;
      const entries = await storage.getAllAccountingEntries(entrepreneurId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching accounting entries:", error);
      res.status(500).json({ message: "Failed to fetch accounting entries" });
    }
  });

  /**
   * @swagger
   * /api/accounting/{id}:
   *   get:
   *     tags: [Accounting]
   *     summary: Get accounting entry by ID
   *     description: Retrieve a specific accounting entry by its ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Accounting entry ID
   *     responses:
   *       200:
   *         description: Accounting entry details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Accounting'
   *       401:
   *         description: Authentication required
   *       404:
   *         description: Accounting entry not found
   *       500:
   *         description: Internal server error
   */
  app.get("/api/accounting/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const entry = await storage.getAccountingEntry(id);
      if (!entry) {
        return res.status(404).json({ message: "Accounting entry not found" });
      }
      res.json(entry);
    } catch (error) {
      console.error("Error fetching accounting entry:", error);
      res.status(500).json({ message: "Failed to fetch accounting entry" });
    }
  });

  /**
   * @swagger
   * /api/accounting:
   *   post:
   *     tags: [Accounting]
   *     summary: Create a new accounting entry
   *     description: Create a new accounting entry (receive or expense) for the authenticated entrepreneur
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateAccounting'
   *           examples:
   *             expense:
   *               summary: Expense entry
   *               value:
   *                 entrepreneurId: 2
   *                 category: "Software Subscription"
   *                 description: "Monthly payment for CRM software"
   *                 date: "2024-01-15T10:30:00Z"
   *                 type: "expenses"
   *                 amount: "299.99"
   *             revenue:
   *               summary: Revenue entry
   *               value:
   *                 entrepreneurId: 2
   *                 category: "Service Revenue"
   *                 description: "Client project payment"
   *                 date: "2024-01-15T14:30:00Z"
   *                 type: "receives"
   *                 amount: "1500.00"
   *     responses:
   *       201:
   *         description: Accounting entry created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Accounting'
   *       400:
   *         description: Invalid data
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 errors:
   *                   type: array
   *                   items:
   *                     type: object
   *       401:
   *         description: Authentication required
   *       500:
   *         description: Internal server error
   */
  app.post("/api/accounting", requireAuth, async (req, res) => {
    try {
      const { date, ...otherData } = req.body;
      const processedData = {
        ...otherData,
        date: new Date(date)
      };
      const validatedData = insertAccountingSchema.parse(processedData);
      const entry = await storage.createAccountingEntry(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: error.errors 
        });
      }
      console.error("Error creating accounting entry:", error);
      res.status(500).json({ message: "Failed to create accounting entry" });
    }
  });

  /**
   * @swagger
   * /api/accounting/{id}:
   *   patch:
   *     tags: [Accounting]
   *     summary: Update accounting entry
   *     description: Update an existing accounting entry by ID
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Accounting entry ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               category:
   *                 type: string
   *                 example: "Office Supplies"
   *               description:
   *                 type: string
   *                 example: "Updated description for office supplies purchase"
   *               date:
   *                 type: string
   *                 format: date-time
   *                 example: "2024-01-20T10:30:00Z"
   *               type:
   *                 type: string
   *                 enum: [receives, expenses]
   *                 example: "expenses"
   *               amount:
   *                 type: string
   *                 pattern: '^\\d+\\.\\d{2}$'
   *                 example: "149.99"
   *           examples:
   *             updateExpense:
   *               summary: Update expense entry
   *               value:
   *                 category: "Office Supplies"
   *                 description: "Updated office supplies purchase"
   *                 amount: "149.99"
   *             updateRevenue:
   *               summary: Update revenue entry
   *               value:
   *                 category: "Consulting Revenue"
   *                 description: "Updated consulting project payment"
   *                 amount: "2500.00"
   *     responses:
   *       200:
   *         description: Accounting entry updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Accounting'
   *       400:
   *         description: Invalid data
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                 errors:
   *                   type: array
   *                   items:
   *                     type: object
   *       401:
   *         description: Authentication required
   *       404:
   *         description: Accounting entry not found
   *       500:
   *         description: Internal server error
   */
  app.patch("/api/accounting/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateAccountingSchema.parse(req.body);
      const entry = await storage.updateAccountingEntry(id, validatedData);
      if (!entry) {
        return res.status(404).json({ message: "Accounting entry not found" });
      }
      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid data", 
          errors: error.errors 
        });
      }
      console.error("Error updating accounting entry:", error);
      res.status(500).json({ message: "Failed to update accounting entry" });
    }
  });

  /**
   * @swagger
   * /api/accounting/{id}:
   *   delete:
   *     tags: [Accounting]
   *     summary: Delete accounting entry
   *     description: Delete an accounting entry by ID. This action is permanent and cannot be undone.
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *         description: Accounting entry ID
   *     responses:
   *       204:
   *         description: Accounting entry deleted successfully
   *       401:
   *         description: Authentication required
   *       404:
   *         description: Accounting entry not found
   *       500:
   *         description: Internal server error
   */
  app.delete("/api/accounting/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAccountingEntry(id);
      if (!deleted) {
        return res.status(404).json({ message: "Accounting entry not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting accounting entry:", error);
      res.status(500).json({ message: "Failed to delete accounting entry" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
