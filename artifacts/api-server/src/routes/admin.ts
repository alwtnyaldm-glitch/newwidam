import crypto from "crypto";
import { Router } from "express";
import { AdminLoginBody } from "@workspace/api-zod";
import { db, usersTable, adminSessionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

function getAdminToken(req: any) {
  const authHeader = req.headers.authorization as string | undefined;
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return null;
  return parts[1];
}

router.post("/login", async (req, res) => {
  try {
    const parsed = AdminLoginBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid request body" });
    }

    const { username, password } = parsed.data;
    const [adminUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username))
      .where(eq(usersTable.isAdmin, true));

    if (!adminUser || adminUser.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (adminUser.isBlocked) {
      return res.status(403).json({ error: "Admin account is blocked" });
    }

    const token = crypto.randomUUID();
    await db.insert(adminSessionsTable).values({
      adminUserId: adminUser.id,
      token,
      isActive: true,
    });

    return res.json({ token, message: "Login successful" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/validate", async (req, res) => {
  try {
    const token = getAdminToken(req);
    if (!token) return res.status(401).json({ error: "Missing token" });

    const [session] = await db
      .select()
      .from(adminSessionsTable)
      .where(eq(adminSessionsTable.token, token))
      .where(eq(adminSessionsTable.isActive, true));

    if (!session) return res.status(401).json({ error: "Invalid token" });

    res.json({ valid: true });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/change-password", async (req, res) => {
  try {
    const token = getAdminToken(req);
    if (!token) return res.status(401).json({ error: "Missing token" });

    const [session] = await db
      .select()
      .from(adminSessionsTable)
      .where(eq(adminSessionsTable.token, token))
      .where(eq(adminSessionsTable.isActive, true));

    if (!session) return res.status(401).json({ error: "Invalid token" });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Missing currentPassword or newPassword" });
    }

    const [adminUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, session.adminUserId));

    if (!adminUser) return res.status(404).json({ error: "Admin user not found" });
    if (adminUser.password !== currentPassword) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    await db
      .update(usersTable)
      .set({ password: newPassword })
      .where(eq(usersTable.id, adminUser.id));

    await db
      .update(adminSessionsTable)
      .set({ isActive: false })
      .where(eq(adminSessionsTable.adminUserId, adminUser.id));

    res.json({ message: "Password changed and all admin sessions logged out" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/logout-all", async (req, res) => {
  try {
    const token = getAdminToken(req);
    if (!token) return res.status(401).json({ error: "Missing token" });

    const [session] = await db
      .select()
      .from(adminSessionsTable)
      .where(eq(adminSessionsTable.token, token))
      .where(eq(adminSessionsTable.isActive, true));

    if (!session) return res.status(401).json({ error: "Invalid token" });

    await db
      .update(adminSessionsTable)
      .set({ isActive: false })
      .where(eq(adminSessionsTable.adminUserId, session.adminUserId));

    res.json({ message: "Logged out from all devices" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
