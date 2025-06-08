import { pgTable, text, serial, timestamp, varchar, boolean, integer, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role", { length: 50 }).notNull().default("customer"),
  avatar: text("avatar"),
  entrepreneurId: integer("entrepreneur_id"), // References users.id, null for super-admin and entrepreneurs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  password: true,
  role: true,
  avatar: true,
  entrepreneurId: true,
});

export const updateUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  password: true,
  role: true,
  avatar: true,
  entrepreneurId: true,
}).partial();

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type User = typeof users.$inferSelect;

// Refresh Tokens table for JWT token management
export const refreshTokens = pgTable("refresh_tokens", {
  id: serial("id").primaryKey(),
  token: text("token").notNull().unique(),
  userId: integer("user_id").references(() => users.id).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isRevoked: boolean("is_revoked").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  revokedAt: timestamp("revoked_at"),
});

export const insertRefreshTokenSchema = createInsertSchema(refreshTokens).pick({
  token: true,
  userId: true,
  expiresAt: true,
});

export type InsertRefreshToken = z.infer<typeof insertRefreshTokenSchema>;
export type RefreshToken = typeof refreshTokens.$inferSelect;

export const paymentGateways = pgTable("payment_gateways", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'asaas', 'mercado_pago', 'pagseguro'
  apiUrl: text("api_url").notNull(),
  publicKey: text("public_key").notNull(),
  token: text("token").notNull(),
  email: text("email"), // Gateway associated email
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: integer("created_by").references(() => users.id),
  entrepreneurId: integer("entrepreneur_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPaymentGatewaySchema = createInsertSchema(paymentGateways).pick({
  name: true,
  type: true,
  apiUrl: true,
  publicKey: true,
  token: true,
  email: true,
  isActive: true,
});

export const updatePaymentGatewaySchema = createInsertSchema(paymentGateways).pick({
  name: true,
  type: true,
  apiUrl: true,
  publicKey: true,
  token: true,
  email: true,
  isActive: true,
}).partial();

export type InsertPaymentGateway = z.infer<typeof insertPaymentGatewaySchema>;
export type UpdatePaymentGateway = z.infer<typeof updatePaymentGatewaySchema>;
export type PaymentGateway = typeof paymentGateways.$inferSelect;

export const collaborators = pgTable("collaborators", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").notNull(), // job title/position
  department: text("department"),
  phone: text("phone"),
  skills: text("skills"), // comma-separated list
  isActive: boolean("is_active").default(true).notNull(),
  hireDate: timestamp("hire_date").defaultNow(),
  entrepreneurId: integer("entrepreneur_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCollaboratorSchema = createInsertSchema(collaborators).pick({
  name: true,
  email: true,
  role: true,
  department: true,
  phone: true,
  skills: true,
  isActive: true,
  hireDate: true,
  entrepreneurId: true,
});

export const updateCollaboratorSchema = createInsertSchema(collaborators).pick({
  name: true,
  email: true,
  role: true,
  department: true,
  phone: true,
  skills: true,
  isActive: true,
  hireDate: true,
}).partial();

export type InsertCollaborator = z.infer<typeof insertCollaboratorSchema>;
export type UpdateCollaborator = z.infer<typeof updateCollaboratorSchema>;
export type Collaborator = typeof collaborators.$inferSelect;

export const whatsappInstances = pgTable("whatsapp_instances", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  instanceNumber: text("instance_number").notNull().unique(),
  apiUrl: text("api_url").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: integer("created_by").references(() => users.id),
  entrepreneurId: integer("entrepreneur_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWhatsappInstanceSchema = createInsertSchema(whatsappInstances).pick({
  name: true,
  instanceNumber: true,
  apiUrl: true,
  isActive: true,
});

export const updateWhatsappInstanceSchema = createInsertSchema(whatsappInstances).pick({
  name: true,
  instanceNumber: true,
  apiUrl: true,
  isActive: true,
}).partial();

export type InsertWhatsappInstance = z.infer<typeof insertWhatsappInstanceSchema>;
export type UpdateWhatsappInstance = z.infer<typeof updateWhatsappInstanceSchema>;
export type WhatsappInstance = typeof whatsappInstances.$inferSelect;

// Price Tables
export const priceTables = pgTable("price_tables", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 500 }),
  advantages: text("advantages").array().notNull().default([]),
  oldPrice3x: text("old_price_3x"),
  currentPrice3x: text("current_price_3x").notNull(),
  oldPrice12x: text("old_price_12x"),
  currentPrice12x: text("current_price_12x").notNull(),
  months: integer("months").default(3),
  image1: varchar("image1", { length: 500 }),
  image2: varchar("image2", { length: 500 }),
  buyLink: varchar("buy_link", { length: 500 }).notNull(),
  isActive: boolean("is_active").default(true),
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPriceTableSchema = createInsertSchema(priceTables).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updatePriceTableSchema = createInsertSchema(priceTables).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

export type InsertPriceTable = z.infer<typeof insertPriceTableSchema>;
export type UpdatePriceTable = z.infer<typeof updatePriceTableSchema>;
export type PriceTable = typeof priceTables.$inferSelect;

// Customer Plans
export const customerPlans = pgTable("customer_plans", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => users.id).notNull(),
  priceTableId: integer("price_table_id").references(() => priceTables.id).notNull(),
  planType: varchar("plan_type", { length: 10 }).notNull(), // '3x' or '12x'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  payHash: varchar("pay_hash", { length: 255 }),
  payStatus: varchar("pay_status", { length: 50 }).notNull().default("pending"), // pending, paid, failed, expired
  payDate: timestamp("pay_date"),
  payLink: text("pay_link"),
  payExpiration: timestamp("pay_expiration"),
  planExpirationDate: timestamp("plan_expiration_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCustomerPlanSchema = createInsertSchema(customerPlans).pick({
  customerId: true,
  priceTableId: true,
  planType: true,
  amount: true,
  payHash: true,
  payStatus: true,
  payDate: true,
  payLink: true,
  payExpiration: true,
  planExpirationDate: true,
  isActive: true,
});

export const updateCustomerPlanSchema = createInsertSchema(customerPlans).pick({
  customerId: true,
  priceTableId: true,
  planType: true,
  amount: true,
  payHash: true,
  payStatus: true,
  payDate: true,
  payLink: true,
  payExpiration: true,
  planExpirationDate: true,
  isActive: true,
}).partial();

export type InsertCustomerPlan = z.infer<typeof insertCustomerPlanSchema>;
export type UpdateCustomerPlan = z.infer<typeof updateCustomerPlanSchema>;
export type CustomerPlan = typeof customerPlans.$inferSelect;

// Customer Plan with joined data type
export type CustomerPlanWithDetails = CustomerPlan & {
  customer: Pick<User, 'id' | 'name' | 'email'>;
  priceTable: Pick<PriceTable, 'id' | 'title' | 'subtitle' | 'currentPrice3x' | 'currentPrice12x' | 'months'>;
};

// Support Tickets
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  ticketId: varchar("ticket_id", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  subject: varchar("subject", { length: 500 }).notNull(),
  category: varchar("category", { length: 50 }).notNull(), // technical, billing, feature, bug, general
  priority: varchar("priority", { length: 20 }).notNull().default("medium"), // low, medium, high, urgent
  message: text("message").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("open"), // open, in_progress, resolved, closed
  assignedTo: integer("assigned_to").references(() => users.id),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).pick({
  name: true,
  email: true,
  phone: true,
  subject: true,
  category: true,
  priority: true,
  message: true,
});

export const updateSupportTicketSchema = createInsertSchema(supportTickets).pick({
  status: true,
  assignedTo: true,
  resolution: true,
  resolvedAt: true,
}).partial();

export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type UpdateSupportTicket = z.infer<typeof updateSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;

export type SupportTicketWithAssignee = SupportTicket & {
  assignee?: Pick<User, 'id' | 'name' | 'email'> | null;
};

// Accounting table
export const accounting = pgTable("accounting", {
  id: serial("id").primaryKey(),
  entrepreneurId: integer("entrepreneur_id").references(() => users.id).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: text("description").notNull(),
  date: timestamp("date").notNull(),
  type: varchar("type", { length: 10 }).notNull(), // 'receives' or 'expenses'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAccountingSchema = createInsertSchema(accounting).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  date: z.coerce.date(),
});

export const updateAccountingSchema = createInsertSchema(accounting).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  date: z.coerce.date().optional(),
}).partial();

export type InsertAccounting = z.infer<typeof insertAccountingSchema>;
export type UpdateAccounting = z.infer<typeof updateAccountingSchema>;
export type Accounting = typeof accounting.$inferSelect;
