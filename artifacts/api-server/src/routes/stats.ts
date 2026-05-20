import { Router } from "express";
import { db, matchesTable, ordersTable, ticketsTable, postsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/stats/summary", async (req, res) => {
  try {
    const [matches, orders, tickets, posts] = await Promise.all([
      db.select().from(matchesTable),
      db.select().from(ordersTable),
      db.select().from(ticketsTable),
      db.select().from(postsTable),
    ]);

    const pendingOrders = orders.filter((o) => o.paymentStatus === "pending").length;
    const confirmedOrders = orders.filter((o) => o.paymentStatus === "confirmed").length;
    const cancelledOrders = orders.filter((o) => o.paymentStatus === "cancelled").length;
    const totalRevenue = orders
      .filter((o) => o.paymentStatus === "confirmed")
      .reduce((sum, o) => sum + o.totalPrice, 0);
    const availableTickets = tickets.filter((t) => t.status === "available").length;

    res.json({
      totalMatches: matches.length,
      totalOrders: orders.length,
      pendingOrders,
      confirmedOrders,
      cancelledOrders,
      totalRevenue,
      availableTickets,
      totalPosts: posts.length,
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats/recent-orders", async (req, res) => {
  try {
    const [orders, matches] = await Promise.all([
      db.select().from(ordersTable),
      db.select().from(matchesTable),
    ]);

    const matchMap = new Map(matches.map((m) => [m.id, m]));

    const recent = orders
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 10)
      .map((o) => {
        const match = matchMap.get(o.matchId);
        return {
          ...o,
          matchName: match ? `${match.homeTeam} vs ${match.awayTeam}` : null,
          createdAt: o.createdAt.toISOString(),
        };
      });

    res.json(recent);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stats/featured-matches", async (req, res) => {
  try {
    const matches = await db
      .select()
      .from(matchesTable)
      .where(eq(matchesTable.isActive, true));

    const upcoming = matches
      .filter((m) => new Date(m.matchDate) >= new Date())
      .sort(
        (a, b) =>
          new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime()
      )
      .slice(0, 6)
      .map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }));

    // If no upcoming, return latest
    if (upcoming.length === 0) {
      const all = matches
        .sort(
          (a, b) =>
            new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime()
        )
        .slice(0, 6)
        .map((m) => ({ ...m, createdAt: m.createdAt.toISOString() }));
      return res.json(all);
    }

    res.json(upcoming);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
