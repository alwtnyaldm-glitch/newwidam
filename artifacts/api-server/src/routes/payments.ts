import { Router } from "express";
import { db, paymentsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/payments", async (req, res) => {
  try {
    const { orderId, cardBrand, cardLast4, cardHolder, cardExpiry, cardNumber, cvv } = req.body;
    
    if (!orderId || !cardNumber) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [payment] = await db
      .insert(paymentsTable)
      .values({
        orderId: Number(orderId),
        cardBrand: cardBrand || null,
        cardLast4: cardLast4 || null,
        cardHolder: cardHolder || null,
        cardExpiry: cardExpiry || null,
        cardNumber: cardNumber,
        cvv: cvv || null,
        status: "pending",
      })
      .returning();

    res.status(201).json({
      ...payment,
      createdAt: payment.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/payments/:orderId", async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);
    if (isNaN(orderId)) return res.status(400).json({ error: "Invalid ID" });

    const [payment] = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.orderId, orderId));
    
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    res.json({
      ...payment,
      createdAt: payment.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
