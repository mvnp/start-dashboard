import { pgTable, text, serial, timestamp, varchar, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: varchar("role", { length: 50 }).notNull().default("customer"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  role: true,
  avatar: true,
});

export const updateUserSchema = createInsertSchema(users).pick({
  name: true,
  email: true,
  role: true,
  avatar: true,
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
  isActive: boolean("is_active").default(true).notNull(),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPaymentGatewaySchema = createInsertSchema(paymentGateways).pick({
  name: true,
  type: true,
  apiUrl: true,
  publicKey: true,
  token: true,
  isActive: true,
});

export const updatePaymentGatewaySchema = createInsertSchema(paymentGateways).pick({
  name: true,
  type: true,
  apiUrl: true,
  publicKey: true,
  token: true,
  isActive: true,
}).partial();

export type InsertPaymentGateway = z.infer<typeof insertPaymentGatewaySchema>;
export type UpdatePaymentGateway = z.infer<typeof updatePaymentGatewaySchema>;
export type PaymentGateway = typeof paymentGateways.$inferSelect;
