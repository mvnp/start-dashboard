import { pgTable, text, serial, timestamp, varchar, boolean, integer } from "drizzle-orm/pg-core";
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
