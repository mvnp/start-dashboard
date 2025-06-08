import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import type { User, PaymentGateway } from "@shared/schema";
import { insertUserSchema, updateUserSchema, insertPaymentGatewaySchema, updatePaymentGatewaySchema, insertCollaboratorSchema, updateCollaboratorSchema } from "@shared/schema";
import { z } from "zod";

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

  const httpServer = createServer(app);
  return httpServer;
}
