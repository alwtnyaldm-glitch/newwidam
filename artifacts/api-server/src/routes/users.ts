import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// Register new user
router.post("/users/register", async (req, res) => {
  try {
    const { username, email, password, name } = req.body;
    
    if (!username || !email || !password || !name) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username));
    
    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const existingEmail = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    
    if (existingEmail.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const [user] = await db
      .insert(usersTable)
      .values({
        username,
        email,
        password, // In production, this should be hashed
        name,
        isAdmin: false,
        isBlocked: false,
      })
      .returning();

    res.status(201).json({
      ...user,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login user
router.post("/users/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, username));
    
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (user.isBlocked) {
      return res.status(403).json({ error: "Account is blocked", reason: user.blockedReason });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate simple token (in production, use JWT)
    const token = `user-${user.id}-${Date.now()}`;

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        isBlocked: user.isBlocked,
      },
      token,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all users (admin only)
router.get("/users", async (req, res) => {
  try {
    const users = await db.select().from(usersTable);
    res.json(users.map(user => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user by ID
router.get("/users/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));
    
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      ...user,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update user
router.patch("/users/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const { name, email, password, isAdmin, isBlocked, blockedReason } = req.body;

    const [user] = await db
      .update(usersTable)
      .set({
        ...(name && { name }),
        ...(email && { email }),
        ...(password && { password }),
        ...(isAdmin !== undefined && { isAdmin }),
        ...(isBlocked !== undefined && { isBlocked }),
        ...(blockedReason !== undefined && { blockedReason }),
      })
      .where(eq(usersTable.id, id))
      .returning();
    
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      ...user,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete user
router.delete("/users/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const [user] = await db
      .delete(usersTable)
      .where(eq(usersTable.id, id))
      .returning();
    
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Change password
router.post("/users/:id/change-password", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));
    
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.password !== currentPassword) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const [updatedUser] = await db
      .update(usersTable)
      .set({ password: newPassword })
      .where(eq(usersTable.id, id))
      .returning();

    res.json({
      ...updatedUser,
      createdAt: updatedUser.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
