import { Router } from "express";
import { db, siteSettingsTable, adminSessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function getAdminToken(req: any) {
  const authHeader = req.headers.authorization as string | undefined;
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  return parts[1];
}

router.get("/settings", async (req, res) => {
  try {
    const settings = await db.select().from(siteSettingsTable);
    res.json(settings.map((setting) => ({
      key: setting.key,
      value: setting.value,
      updatedAt: setting.updatedAt instanceof Date ? setting.updatedAt.toISOString() : new Date(setting.updatedAt).toISOString(),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/settings", async (req, res) => {
  try {
    const token = getAdminToken(req);
    if (!token) return res.status(401).json({ error: "Missing token" });

    const [session] = await db
      .select()
      .from(adminSessionsTable)
      .where(eq(adminSessionsTable.token, token))
      .where(eq(adminSessionsTable.isActive, true));

    if (!session) return res.status(401).json({ error: "Invalid token" });

    const updates = req.body?.data;
    if (!updates || typeof updates !== "object") {
      return res.status(400).json({ error: "Invalid data payload" });
    }

    for (const [key, value] of Object.entries(updates)) {
      if (typeof value !== "string") continue;

      const [existing] = await db
        .select()
        .from(siteSettingsTable)
        .where(eq(siteSettingsTable.key, key));

      if (existing) {
        await db
          .update(siteSettingsTable)
          .set({ value, updatedAt: new Date() })
          .where(eq(siteSettingsTable.key, key));
      } else {
        await db.insert(siteSettingsTable).values({ key, value });
      }
    }

    const settings = await db.select().from(siteSettingsTable);
    res.json(settings.map((setting) => ({
      key: setting.key,
      value: setting.value,
      updatedAt: setting.updatedAt instanceof Date ? setting.updatedAt.toISOString() : new Date(setting.updatedAt).toISOString(),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
