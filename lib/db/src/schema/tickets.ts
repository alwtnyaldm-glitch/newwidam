import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { matchesTable } from "./matches";

export const ticketsTable = sqliteTable("tickets", {
  id: integer("id").primaryKey({ mode: "autoincrement" }),
  matchId: integer("match_id").notNull().references(() => matchesTable.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  categoryAr: text("category_ar").notNull(),
  seatNumber: text("seat_number").notNull(),
  section: text("section").notNull(),
  row: text("row"),
  price: real("price").notNull(),
  status: text("status", { enum: ["available", "reserved", "sold"] }).notNull().default("available"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
});

export const insertTicketSchema = createInsertSchema(ticketsTable).omit({ id: true, createdAt: true });
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof ticketsTable.$inferSelect;
