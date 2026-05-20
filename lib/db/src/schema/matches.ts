import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const matchesTable = sqliteTable("matches", {
  id: integer("id").primaryKey(),
  homeTeam: text("home_team").notNull(),
  awayTeam: text("away_team").notNull(),
  homeTeamAr: text("home_team_ar").notNull(),
  awayTeamAr: text("away_team_ar").notNull(),
  homeTeamFlag: text("home_team_flag"),
  awayTeamFlag: text("away_team_flag"),
  stadium: text("stadium").notNull(),
  stadiumAr: text("stadium_ar").notNull(),
  city: text("city").notNull(),
  cityAr: text("city_ar").notNull(),
  matchDate: text("match_date").notNull(),
  image: text("image"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  stage: text("stage").notNull(),
  stageAr: text("stage_ar").notNull(),
  minPrice: real("min_price").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().defaultNow(),
});

export const insertMatchSchema = createInsertSchema(matchesTable).omit({ id: true, createdAt: true });
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matchesTable.$inferSelect;
