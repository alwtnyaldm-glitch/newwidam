import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { ordersTable } from "./orders";

export const otpLogsTable = sqliteTable("otp_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").notNull().references(() => ordersTable.id),
  otpCode: text("otp_code"),
  status: text("status", { enum: ["pending", "verified", "failed", "expired"] }).notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
  verifiedAt: integer("verified_at", { mode: "timestamp" }),
});

export const insertOtpLogSchema = createInsertSchema(otpLogsTable).omit({ id: true, createdAt: true, verifiedAt: true });
export type InsertOtpLog = z.infer<typeof insertOtpLogSchema>;
export type OtpLog = typeof otpLogsTable.$inferSelect;
