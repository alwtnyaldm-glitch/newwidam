import { Router } from "express";
import { db, messagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// Create message
router.post("/messages", async (req, res) => {
  try {
    const { title, content, targetUserId, targetVisitorId, isGlobal } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    const [message] = await db
      .insert(messagesTable)
      .values({
        title,
        content,
        targetUserId: targetUserId || null,
        targetVisitorId: targetVisitorId || null,
        isGlobal: isGlobal || false,
        isActive: true,
      })
      .returning();

    res.json({
      ...message,
      createdAt: message.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all messages
router.get("/messages", async (req, res) => {
  try {
    const messages = await db.select().from(messagesTable);
    res.json(messages.map(message => ({
      ...message,
      createdAt: message.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get messages for specific user
router.get("/messages/user/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (isNaN(userId)) return res.status(400).json({ error: "Invalid user ID" });

    const messages = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.targetUserId, userId));

    res.json(messages.map(message => ({
      ...message,
      createdAt: message.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get messages for specific visitor
router.get("/messages/visitor/:visitorId", async (req, res) => {
  try {
    const visitorId = Number(req.params.visitorId);
    if (isNaN(visitorId)) return res.status(400).json({ error: "Invalid visitor ID" });

    const messages = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.targetVisitorId, visitorId));

    res.json(messages.map(message => ({
      ...message,
      createdAt: message.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get active global messages
router.get("/messages/global", async (req, res) => {
  try {
    const messages = await db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.isGlobal, true));

    const activeMessages = messages.filter(m => m.isActive);

    res.json(activeMessages.map(message => ({
      ...message,
      createdAt: message.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update message
router.patch("/messages/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid message ID" });

    const { title, content, isActive } = req.body;

    const [message] = await db
      .update(messagesTable)
      .set({
        ...(title && { title }),
        ...(content && { content }),
        ...(isActive !== undefined && { isActive }),
      })
      .where(eq(messagesTable.id, id))
      .returning();
    
    if (!message) return res.status(404).json({ error: "Message not found" });

    res.json({
      ...message,
      createdAt: message.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete message
router.delete("/messages/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid message ID" });

    const [message] = await db
      .delete(messagesTable)
      .where(eq(messagesTable.id, id))
      .returning();
    
    if (!message) return res.status(404).json({ error: "Message not found" });

    res.json({ message: "Message deleted successfully" });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
