import { Router } from "express";
import { db, matchesTable } from "@workspace/db";
import { eq, ilike, asc, desc } from "drizzle-orm";
import {
  CreateMatchBody,
  UpdateMatchBody,
  ListMatchesQueryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/matches", async (req, res) => {
  try {
    const parsed = ListMatchesQueryParams.safeParse(req.query);
    const params = parsed.success ? parsed.data : {};

    let query = db.select().from(matchesTable);

    const conditions = [];
    if (params.search) {
      conditions.push(ilike(matchesTable.homeTeam, `%${params.search}%`));
    }

    const rows = await db.select().from(matchesTable);

    let filtered = rows;
    if (params.search) {
      const s = params.search.toLowerCase();
      filtered = rows.filter(
        (m) =>
          m.homeTeam.toLowerCase().includes(s) ||
          m.awayTeam.toLowerCase().includes(s) ||
          m.homeTeamAr.includes(s) ||
          m.awayTeamAr.includes(s) ||
          m.stadium.toLowerCase().includes(s) ||
          m.city.toLowerCase().includes(s)
      );
    }

    if (params.sortBy === "price") {
      filtered.sort((a, b) =>
        params.sortOrder === "desc"
          ? b.minPrice - a.minPrice
          : a.minPrice - b.minPrice
      );
    } else if (params.sortBy === "date") {
      filtered.sort((a, b) =>
        params.sortOrder === "desc"
          ? new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime()
          : new Date(a.matchDate).getTime() - new Date(b.matchDate).getTime()
      );
    }

    const result = filtered.map((m) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    }));

    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/matches", async (req, res) => {
  try {
    const parsed = CreateMatchBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }
    const data = parsed.data;
    const [match] = await db
      .insert(matchesTable)
      .values({
        homeTeam: data.homeTeam,
        awayTeam: data.awayTeam,
        homeTeamAr: data.homeTeamAr,
        awayTeamAr: data.awayTeamAr,
        homeTeamFlag: data.homeTeamFlag ?? null,
        awayTeamFlag: data.awayTeamFlag ?? null,
        stadium: data.stadium,
        stadiumAr: data.stadiumAr,
        city: data.city,
        cityAr: data.cityAr,
        matchDate: data.matchDate,
        image: data.image ?? null,
        description: data.description ?? null,
        descriptionAr: data.descriptionAr ?? null,
        stage: data.stage,
        stageAr: data.stageAr,
        minPrice: data.minPrice,
        isActive: data.isActive ?? true,
      })
      .returning();
    res.status(201).json({ ...match, createdAt: match.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/matches/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const [match] = await db
      .select()
      .from(matchesTable)
      .where(eq(matchesTable.id, id));
    if (!match) return res.status(404).json({ error: "Match not found" });
    res.json({ ...match, createdAt: match.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/matches/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const parsed = UpdateMatchBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }
    const data = parsed.data;
    const updateData: Record<string, unknown> = {};
    if (data.homeTeam !== undefined) updateData.homeTeam = data.homeTeam;
    if (data.awayTeam !== undefined) updateData.awayTeam = data.awayTeam;
    if (data.homeTeamAr !== undefined) updateData.homeTeamAr = data.homeTeamAr;
    if (data.awayTeamAr !== undefined) updateData.awayTeamAr = data.awayTeamAr;
    if (data.homeTeamFlag !== undefined) updateData.homeTeamFlag = data.homeTeamFlag;
    if (data.awayTeamFlag !== undefined) updateData.awayTeamFlag = data.awayTeamFlag;
    if (data.stadium !== undefined) updateData.stadium = data.stadium;
    if (data.stadiumAr !== undefined) updateData.stadiumAr = data.stadiumAr;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.cityAr !== undefined) updateData.cityAr = data.cityAr;
    if (data.matchDate !== undefined) updateData.matchDate = data.matchDate;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.descriptionAr !== undefined) updateData.descriptionAr = data.descriptionAr;
    if (data.stage !== undefined) updateData.stage = data.stage;
    if (data.stageAr !== undefined) updateData.stageAr = data.stageAr;
    if (data.minPrice !== undefined) updateData.minPrice = data.minPrice;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const [match] = await db
      .update(matchesTable)
      .set(updateData)
      .where(eq(matchesTable.id, id))
      .returning();
    if (!match) return res.status(404).json({ error: "Match not found" });
    res.json({ ...match, createdAt: match.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/matches/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    await db.delete(matchesTable).where(eq(matchesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
