import { Router } from "express";
import { db, otpLogsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/otp-logs", async (req, res) => {
  try {
    const { orderId, otpCode, status, attempts } = req.body;
    
    if (!orderId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [otpLog] = await db
      .insert(otpLogsTable)
      .values({
        orderId: Number(orderId),
        otpCode: otpCode || null,
        status: status || "pending",
        attempts: Number(attempts) || 1,
      })
      .returning();

    res.status(201).json({
      ...otpLog,
      createdAt: otpLog.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/otp-logs/:orderId", async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);
    if (isNaN(orderId)) return res.status(400).json({ error: "Invalid ID" });

    const otpLogs = await db
      .select()
      .from(otpLogsTable)
      .where(eq(otpLogsTable.orderId, orderId));

    res.json(otpLogs.map(log => ({
      ...log,
      createdAt: log.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
