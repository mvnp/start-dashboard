import { users, paymentGateways, collaborators, whatsappInstances, priceTables, customerPlans, type User, type InsertUser, type UpdateUser, type PaymentGateway, type InsertPaymentGateway, type UpdatePaymentGateway, type Collaborator, type InsertCollaborator, type UpdateCollaborator, type WhatsappInstance, type InsertWhatsappInstance, type UpdateWhatsappInstance, type PriceTable, type InsertPriceTable, type UpdatePriceTable, type CustomerPlan, type InsertCustomerPlan, type UpdateCustomerPlan, type CustomerPlanWithDetails } from "@shared/schema";
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

  // WhatsApp Instance operations
  getWhatsappInstance(id: number): Promise<WhatsappInstance | undefined>;
  getAllWhatsappInstances(entrepreneurId?: number): Promise<WhatsappInstance[]>;
  createWhatsappInstance(instance: InsertWhatsappInstance & { createdBy: number; entrepreneurId: number }): Promise<WhatsappInstance>;
  updateWhatsappInstance(id: number, instance: UpdateWhatsappInstance): Promise<WhatsappInstance | undefined>;
  deleteWhatsappInstance(id: number): Promise<boolean>;

  // Price Table operations  
  getPriceTable(id: number): Promise<PriceTable | undefined>;
  getAllPriceTables(): Promise<PriceTable[]>;
  createPriceTable(priceTable: InsertPriceTable): Promise<PriceTable>;
  updatePriceTable(id: number, priceTable: UpdatePriceTable): Promise<PriceTable | undefined>;
  deletePriceTable(id: number): Promise<boolean>;

  // Customer Plan operations
  getCustomerPlan(id: number): Promise<CustomerPlan | undefined>;
  getAllCustomerPlans(): Promise<CustomerPlanWithDetails[]>;
  getCustomerPlansByCustomer(customerId: number): Promise<CustomerPlanWithDetails[]>;
  createCustomerPlan(plan: InsertCustomerPlan): Promise<CustomerPlan>;
  updateCustomerPlan(id: number, plan: UpdateCustomerPlan): Promise<CustomerPlan | undefined>;
  deleteCustomerPlan(id: number): Promise<boolean>;
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

  // WhatsApp Instance operations
  async getWhatsappInstance(id: number): Promise<WhatsappInstance | undefined> {
    const [instance] = await db.select().from(whatsappInstances).where(eq(whatsappInstances.id, id));
    return instance || undefined;
  }

  async getAllWhatsappInstances(entrepreneurId?: number): Promise<WhatsappInstance[]> {
    if (entrepreneurId) {
      return await db.select().from(whatsappInstances).where(eq(whatsappInstances.entrepreneurId, entrepreneurId));
    }
    return await db.select().from(whatsappInstances);
  }

  async createWhatsappInstance(instance: InsertWhatsappInstance & { createdBy: number; entrepreneurId: number }): Promise<WhatsappInstance> {
    const [newInstance] = await db
      .insert(whatsappInstances)
      .values(instance)
      .returning();
    return newInstance;
  }

  async updateWhatsappInstance(id: number, instance: UpdateWhatsappInstance): Promise<WhatsappInstance | undefined> {
    const [updatedInstance] = await db
      .update(whatsappInstances)
      .set({ ...instance, updatedAt: new Date() })
      .where(eq(whatsappInstances.id, id))
      .returning();
    return updatedInstance || undefined;
  }

  async deleteWhatsappInstance(id: number): Promise<boolean> {
    const result = await db.delete(whatsappInstances).where(eq(whatsappInstances.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Price Table operations
  async getPriceTable(id: number): Promise<PriceTable | undefined> {
    const [priceTable] = await db.select().from(priceTables).where(eq(priceTables.id, id));
    return priceTable || undefined;
  }

  async getAllPriceTables(): Promise<PriceTable[]> {
    return await db.select().from(priceTables).orderBy(priceTables.displayOrder, priceTables.id);
  }

  async createPriceTable(insertPriceTable: InsertPriceTable): Promise<PriceTable> {
    const [priceTable] = await db
      .insert(priceTables)
      .values(insertPriceTable)
      .returning();
    return priceTable;
  }

  async updatePriceTable(id: number, priceTable: UpdatePriceTable): Promise<PriceTable | undefined> {
    const [updatedPriceTable] = await db
      .update(priceTables)
      .set({ ...priceTable, updatedAt: new Date() })
      .where(eq(priceTables.id, id))
      .returning();
    return updatedPriceTable || undefined;
  }

  async deletePriceTable(id: number): Promise<boolean> {
    const result = await db.delete(priceTables).where(eq(priceTables.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Customer Plan operations
  async getCustomerPlan(id: number): Promise<CustomerPlan | undefined> {
    const [plan] = await db.select().from(customerPlans).where(eq(customerPlans.id, id));
    return plan || undefined;
  }

  async getAllCustomerPlans(): Promise<CustomerPlanWithDetails[]> {
    const plans = await db.select().from(customerPlans).orderBy(customerPlans.createdAt);
    
    // Fetch related data for each plan
    const plansWithDetails: CustomerPlanWithDetails[] = [];
    
    for (const plan of plans) {
      const [customer] = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
      }).from(users).where(eq(users.id, plan.customerId));

      const [priceTable] = await db.select({
        id: priceTables.id,
        title: priceTables.title,
        subtitle: priceTables.subtitle,
        currentPrice3x: priceTables.currentPrice3x,
        currentPrice12x: priceTables.currentPrice12x,
        months: priceTables.months,
      }).from(priceTables).where(eq(priceTables.id, plan.priceTableId));

      plansWithDetails.push({
        ...plan,
        customer: customer || { id: 0, name: '', email: '' },
        priceTable: priceTable || { id: 0, title: '', subtitle: '', currentPrice3x: '', currentPrice12x: '', months: 0 }
      });
    }

    return plansWithDetails;
  }

  async getCustomerPlansByCustomer(customerId: number): Promise<CustomerPlanWithDetails[]> {
    const plans = await db.select()
      .from(customerPlans)
      .where(eq(customerPlans.customerId, customerId))
      .orderBy(customerPlans.createdAt);

    const plansWithDetails: CustomerPlanWithDetails[] = [];
    
    for (const plan of plans) {
      const [customer] = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
      }).from(users).where(eq(users.id, plan.customerId));

      const [priceTable] = await db.select({
        id: priceTables.id,
        title: priceTables.title,
        subtitle: priceTables.subtitle,
        currentPrice3x: priceTables.currentPrice3x,
        currentPrice12x: priceTables.currentPrice12x,
        months: priceTables.months,
      }).from(priceTables).where(eq(priceTables.id, plan.priceTableId));

      plansWithDetails.push({
        ...plan,
        customer: customer || { id: 0, name: '', email: '' },
        priceTable: priceTable || { id: 0, title: '', subtitle: '', currentPrice3x: '', currentPrice12x: '', months: 0 }
      });
    }

    return plansWithDetails;
  }

  async createCustomerPlan(insertPlan: InsertCustomerPlan): Promise<CustomerPlan> {
    const [plan] = await db
      .insert(customerPlans)
      .values(insertPlan)
      .returning();
    return plan;
  }

  async updateCustomerPlan(id: number, plan: UpdateCustomerPlan): Promise<CustomerPlan | undefined> {
    const [updatedPlan] = await db
      .update(customerPlans)
      .set({ ...plan, updatedAt: new Date() })
      .where(eq(customerPlans.id, id))
      .returning();
    return updatedPlan || undefined;
  }

  async deleteCustomerPlan(id: number): Promise<boolean> {
    const result = await db.delete(customerPlans).where(eq(customerPlans.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage = new DatabaseStorage();
