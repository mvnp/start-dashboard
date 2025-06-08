import { users, paymentGateways, type User, type InsertUser, type UpdateUser, type PaymentGateway, type InsertPaymentGateway, type UpdatePaymentGateway } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: UpdateUser): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Payment Gateway operations
  getPaymentGateway(id: number): Promise<PaymentGateway | undefined>;
  getAllPaymentGateways(): Promise<PaymentGateway[]>;
  createPaymentGateway(gateway: InsertPaymentGateway & { createdBy: number }): Promise<PaymentGateway>;
  updatePaymentGateway(id: number, gateway: UpdatePaymentGateway): Promise<PaymentGateway | undefined>;
  deletePaymentGateway(id: number): Promise<boolean>;
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

  async getAllUsers(): Promise<User[]> {
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

  async getAllPaymentGateways(): Promise<PaymentGateway[]> {
    return await db.select().from(paymentGateways);
  }

  async createPaymentGateway(gateway: InsertPaymentGateway & { createdBy: number }): Promise<PaymentGateway> {
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
}

export const storage = new DatabaseStorage();
