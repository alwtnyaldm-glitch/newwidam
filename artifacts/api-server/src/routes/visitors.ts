import { Router } from "express";
import { db, visitorsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

// Track visitor
router.post("/visitors", async (req, res) => {
  try {
    const { sessionId, name, userId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: "Session ID is required" });
    }

    // Check if visitor already exists
    const [existingVisitor] = await db
      .select()
      .from(visitorsTable)
      .where(eq(visitorsTable.sessionId, sessionId));
    
    if (existingVisitor) {
      // Update last visit and increment count
      const [updatedVisitor] = await db
        .update(visitorsTable)
        .set({
          lastVisit: new Date(),
          visitCount: existingVisitor.visitCount + 1,
          isOnline: true,
          ...(name && { name }),
          ...(userId && { userId }),
        })
        .where(eq(visitorsTable.sessionId, sessionId))
        .returning();

      res.json({
        ...updatedVisitor,
        createdAt: updatedVisitor.createdAt.toISOString(),
        lastVisit: updatedVisitor.lastVisit.toISOString(),
      });
    } else {
      // Create new visitor
      const [visitor] = await db
        .insert(visitorsTable)
        .values({
          sessionId,
          name: name || null,
          userId: userId || null,
          lastVisit: new Date(),
          visitCount: 1,
          isOnline: true,
        })
        .returning();

      res.json({
        ...visitor,
        createdAt: visitor.createdAt.toISOString(),
        lastVisit: visitor.lastVisit.toISOString(),
      });
    }
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all visitors
router.get("/visitors", async (req, res) => {
  try {
    const visitors = await db.select().from(visitorsTable);
    res.json(visitors.map(visitor => ({
      ...visitor,
      createdAt: visitor.createdAt.toISOString(),
      lastVisit: visitor.lastVisit.toISOString(),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get visitor by session ID
router.get("/visitors/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const [visitor] = await db
      .select()
      .from(visitorsTable)
      .where(eq(visitorsTable.sessionId, sessionId));
    
    if (!visitor) return res.status(404).json({ error: "Visitor not found" });

    res.json({
      ...visitor,
      createdAt: visitor.createdAt.toISOString(),
      lastVisit: visitor.lastVisit.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update visitor online status
router.patch("/visitors/:sessionId/status", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { isOnline } = req.body;
    
    if (isOnline === undefined) {
      return res.status(400).json({ error: "isOnline is required" });
    }

    const [visitor] = await db
      .update(visitorsTable)
      .set({
        isOnline,
        lastVisit: new Date(),
      })
      .where(eq(visitorsTable.sessionId, sessionId))
      .returning();
    
    if (!visitor) return res.status(404).json({ error: "Visitor not found" });

    res.json({
      ...visitor,
      createdAt: visitor.createdAt.toISOString(),
      lastVisit: visitor.lastVisit.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get visitor statistics
router.get("/visitors/stats", async (req, res) => {
  try {
    const visitors = await db.select().from(visitorsTable);
    
    const totalVisitors = visitors.length;
    const onlineVisitors = visitors.filter(v => v.isOnline).length;
    const uniqueNames = visitors.filter(v => v.name).length;
    const totalVisits = visitors.reduce((sum, v) => sum + v.visitCount, 0);

    res.json({
      totalVisitors,
      onlineVisitors,
      uniqueNames,
      totalVisits,
      visitors: visitors.map(v => ({
        id: v.id,
        sessionId: v.sessionId,
        name: v.name || "زائر جديد",
        userId: v.userId,
        visitCount: v.visitCount,
        isOnline: v.isOnline,
        lastVisit: v.lastVisit.toISOString(),
      })),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
