import { Router } from "express";
import { db, postsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreatePostBody, UpdatePostBody } from "@workspace/api-zod";

const router = Router();

router.get("/posts", async (req, res) => {
  try {
    const posts = await db.select().from(postsTable);
    const result = posts
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .map((p) => ({ ...p, createdAt: p.createdAt.toISOString() }));
    res.json(result);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/posts", async (req, res) => {
  try {
    const parsed = CreatePostBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }
    const data = parsed.data;
    const [post] = await db
      .insert(postsTable)
      .values({
        title: data.title,
        titleAr: data.titleAr,
        content: data.content,
        contentAr: data.contentAr,
        image: data.image ?? null,
        isPublished: data.isPublished ?? true,
      })
      .returning();
    res.status(201).json({ ...post, createdAt: post.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/posts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const parsed = UpdatePostBody.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }
    const data = parsed.data;
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.titleAr !== undefined) updateData.titleAr = data.titleAr;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.contentAr !== undefined) updateData.contentAr = data.contentAr;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;

    const [post] = await db
      .update(postsTable)
      .set(updateData)
      .where(eq(postsTable.id, id))
      .returning();
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json({ ...post, createdAt: post.createdAt.toISOString() });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/posts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    await db.delete(postsTable).where(eq(postsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
