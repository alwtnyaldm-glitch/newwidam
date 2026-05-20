import { Router } from "express";
import { db, productsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

const router = Router();

router.get("/products", async (req, res) => {
  try {
    const products = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.isActive, true))
      .orderBy(desc(productsTable.createdAt));

    res.json(products.map(p => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, id));
    
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json({
      ...product,
      createdAt: product.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/products", async (req, res) => {
  try {
    const { title, titleAr, description, descriptionAr, image, price, category, categoryAr } = req.body;
    
    if (!title || !titleAr || !price || !category || !categoryAr) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [product] = await db
      .insert(productsTable)
      .values({
        title,
        titleAr,
        description: description || null,
        descriptionAr: descriptionAr || null,
        image: image || null,
        price: Number(price),
        category,
        categoryAr,
        isActive: true,
      })
      .returning();

    res.status(201).json({
      ...product,
      createdAt: product.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const updateData: Record<string, unknown> = {};
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.titleAr !== undefined) updateData.titleAr = req.body.titleAr;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.descriptionAr !== undefined) updateData.descriptionAr = req.body.descriptionAr;
    if (req.body.image !== undefined) updateData.image = req.body.image;
    if (req.body.price !== undefined) updateData.price = Number(req.body.price);
    if (req.body.category !== undefined) updateData.category = req.body.category;
    if (req.body.categoryAr !== undefined) updateData.categoryAr = req.body.categoryAr;
    if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;

    const [product] = await db
      .update(productsTable)
      .set(updateData)
      .where(eq(productsTable.id, id))
      .returning();
    
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json({
      ...product,
      createdAt: product.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const [product] = await db
      .update(productsTable)
      .set({ isActive: false })
      .where(eq(productsTable.id, id))
      .returning();
    
    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json({
      ...product,
      createdAt: product.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
