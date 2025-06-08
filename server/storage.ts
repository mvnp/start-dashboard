import { users, paymentGateways, collaborators, type User, type InsertUser, type UpdateUser, type PaymentGateway, type InsertPaymentGateway, type UpdatePaymentGateway, type Collaborator, type InsertCollaborator, type UpdateCollaborator } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(entrepreneurId?: number): Promise<User[]>; // Super admin sees all, entrepreneur sees their users
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: UpdateUser): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Payment Gateway operations
  getPaymentGateway(id: number): Promise<PaymentGateway | undefined>;
  getAllPaymentGateways(entrepreneurId?: number): Promise<PaymentGateway[]>; // Super admin sees all, entrepreneur sees their gateways
  createPaymentGateway(gateway: InsertPaymentGateway & { createdBy: number; entrepreneurId: number }): Promise<PaymentGateway>;
  updatePaymentGateway(id: number, gateway: UpdatePaymentGateway): Promise<PaymentGateway | undefined>;
  deletePaymentGateway(id: number): Promise<boolean>;

  // Collaborator operations
  getCollaborator(id: number): Promise<Collaborator | undefined>;
  getAllCollaborators(): Promise<Collaborator[]>;
  getCollaboratorsByEntrepreneur(entrepreneurId: number): Promise<Collaborator[]>;
  createCollaborator(collaborator: InsertCollaborator & { entrepreneurId: number }): Promise<Collaborator>;
  updateCollaborator(id: number, collaborator: UpdateCollaborator): Promise<Collaborator | undefined>;
  deleteCollaborator(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getAllUsers(entrepreneurId?: number): Promise<User[]> {
    if (entrepreneurId) {
      // Entrepreneur sees only their users (collaborators and customers)
      return await db.select().from(users).where(eq(users.entrepreneurId, entrepreneurId));
    }
    // Super admin sees all users
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updateUser: UpdateUser): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updateUser, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Payment Gateway operations
  async getPaymentGateway(id: number): Promise<PaymentGateway | undefined> {
    const [gateway] = await db.select().from(paymentGateways).where(eq(paymentGateways.id, id));
    return gateway || undefined;
  }

  async getAllPaymentGateways(entrepreneurId?: number): Promise<PaymentGateway[]> {
    if (entrepreneurId) {
      // Entrepreneur sees only their payment gateways
      return await db.select().from(paymentGateways).where(eq(paymentGateways.entrepreneurId, entrepreneurId));
    }
    // Super admin sees all payment gateways
    return await db.select().from(paymentGateways);
  }

  async createPaymentGateway(gateway: InsertPaymentGateway & { createdBy: number; entrepreneurId: number }): Promise<PaymentGateway> {
    const [createdGateway] = await db
      .insert(paymentGateways)
      .values(gateway)
      .returning();
    return createdGateway;
  }

  async updatePaymentGateway(id: number, gateway: UpdatePaymentGateway): Promise<PaymentGateway | undefined> {
    const [updatedGateway] = await db
      .update(paymentGateways)
      .set({ ...gateway, updatedAt: new Date() })
      .where(eq(paymentGateways.id, id))
      .returning();
    return updatedGateway || undefined;
  }

  async deletePaymentGateway(id: number): Promise<boolean> {
    const result = await db.delete(paymentGateways).where(eq(paymentGateways.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Collaborator operations
  async getCollaborator(id: number): Promise<Collaborator | undefined> {
    const [collaborator] = await db.select().from(collaborators).where(eq(collaborators.id, id));
    return collaborator || undefined;
  }

  async getAllCollaborators(): Promise<Collaborator[]> {
    return await db.select().from(collaborators);
  }

  async getCollaboratorsByEntrepreneur(entrepreneurId: number): Promise<Collaborator[]> {
    return await db.select().from(collaborators).where(eq(collaborators.entrepreneurId, entrepreneurId));
  }

  async createCollaborator(collaborator: InsertCollaborator & { entrepreneurId: number }): Promise<Collaborator> {
    const [createdCollaborator] = await db
      .insert(collaborators)
      .values(collaborator)
      .returning();
    return createdCollaborator;
  }

  async updateCollaborator(id: number, collaborator: UpdateCollaborator): Promise<Collaborator | undefined> {
    const [updatedCollaborator] = await db
      .update(collaborators)
      .set({ ...collaborator, updatedAt: new Date() })
      .where(eq(collaborators.id, id))
      .returning();
    return updatedCollaborator || undefined;
  }

  async deleteCollaborator(id: number): Promise<boolean> {
    const result = await db.delete(collaborators).where(eq(collaborators.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage = new DatabaseStorage();
