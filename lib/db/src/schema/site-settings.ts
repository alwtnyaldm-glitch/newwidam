import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";

type SiteSettingsTable = {
  key: string;
  value: string;
  updatedAt: Date;
};

export const siteSettingsTable = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().defaultNow(),
});

export const insertSiteSettingSchema = createInsertSchema(siteSettingsTable).omit({ updatedAt: true });
export type SiteSetting = typeof siteSettingsTable.$inferSelect;
