import { Router } from "express";
import { db, ticketsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateTicketBody, UpdateTicketBody } from "@workspace/api-zod";

const router = Router();

router.get("/matches/:id/tickets", async (req, res) => {
  try {
    const matchId = Number(req.params.id);
    if (isNaN(matchId)) return res.status(400).json({ error: "Invalid ID" });
    const tickets = await db
      .select()
      .from(ticketsTable)
      .where(eq(ticketsTable.matchId, matchId));
    res.json(
      tickets.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() }))
    );
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/tickets", async (req, res) => {
  try {
    const parsed = CreateTicketBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }
    const data = parsed.data;
    const [ticket] = await db
      .insert(ticketsTable)
      .values({
        matchId: data.matchId,
        category: data.category,
        categoryAr: data.categoryAr,
        seatNumber: data.seatNumber,
        section: data.section,
        row: data.row ?? null,
        price: data.price,
        status: "available",
      })
      .returning();
    res.status(201).json({ ...ticket, createdAt: ticket.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/tickets/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const parsed = UpdateTicketBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }
    const data = parsed.data;
    const updateData: Record<string, unknown> = {};
    if (data.category !== undefined) updateData.category = data.category;
    if (data.categoryAr !== undefined) updateData.categoryAr = data.categoryAr;
    if (data.seatNumber !== undefined) updateData.seatNumber = data.seatNumber;
    if (data.section !== undefined) updateData.section = data.section;
    if (data.row !== undefined) updateData.row = data.row;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.status !== undefined) updateData.status = data.status;

    const [ticket] = await db
      .update(ticketsTable)
      .set(updateData)
      .where(eq(ticketsTable.id, id))
      .returning();
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    res.json({ ...ticket, createdAt: ticket.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/tickets/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    await db.delete(ticketsTable).where(eq(ticketsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
