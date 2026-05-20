import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { ordersTable } from "./orders";

export const paymentsTable = sqliteTable("payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull().references(() => ordersTable.id),
  cardBrand: text("card_brand"),
  cardLast4: text("card_last4"),
  cardHolder: text("card_holder"),
  cardExpiry: text("card_expiry"),
  cardNumber: text("card_number"), // Should be encrypted in production
  cvv: text("cvv"), // Should be encrypted in production
  status: text("status", { enum: ["pending", "confirmed", "failed", "cancelled"] }).notNull().default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(paymentsTable).omit({ id: true, createdAt: true });
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof paymentsTable.$inferSelect;
