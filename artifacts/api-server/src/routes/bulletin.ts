import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, bulletinTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/bulletin", async (req, res) => {
  try {
    const items = await db.select().from(bulletinTable).orderBy(bulletinTable.createdAt);
    res.json(items);
  } catch (e) {
    req.log.error(e, "Failed to list bulletin");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/bulletin", async (req, res) => {
  try {
    const { category, title, content, url, sortOrder } = req.body;
    if (!category || !title) { res.status(400).json({ error: "Category and title are required" }); return; }
    const [created] = await db.insert(bulletinTable).values({
      category: String(category),
      title: String(title),
      content: String(content || ""),
      url: String(url || ""),
      sortOrder: String(sortOrder || "0"),
    }).returning();
    res.status(201).json(created);
  } catch (e) {
    req.log.error(e, "Failed to create bulletin item");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/bulletin/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const { category, title, content, url, sortOrder } = req.body;
    const updates: Record<string, unknown> = {};
    if (category !== undefined) updates.category = String(category);
    if (title !== undefined) updates.title = String(title);
    if (content !== undefined) updates.content = String(content);
    if (url !== undefined) updates.url = String(url);
    if (sortOrder !== undefined) updates.sortOrder = String(sortOrder);
    const [updated] = await db.update(bulletinTable).set(updates).where(eq(bulletinTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Item not found" }); return; }
    res.json(updated);
  } catch (e) {
    req.log.error(e, "Failed to update bulletin item");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/bulletin/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const deleted = await db.delete(bulletinTable).where(eq(bulletinTable.id, id)).returning();
    if (deleted.length === 0) { res.status(404).json({ error: "Item not found" }); return; }
    res.status(204).send();
  } catch (e) {
    req.log.error(e, "Failed to delete bulletin item");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
