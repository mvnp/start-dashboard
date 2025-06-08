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
