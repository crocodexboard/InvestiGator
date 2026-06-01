import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, customBordersTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/custom-borders", async (req, res) => {
  try {
    const borders = await db.select().from(customBordersTable).orderBy(customBordersTable.createdAt);
    res.json(borders);
  } catch (e) {
    req.log.error(e, "Failed to list custom borders");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/custom-borders", async (req, res) => {
  try {
    const { name, imageData } = req.body;
    if (!name) { res.status(400).json({ error: "Name is required" }); return; }
    if (!imageData) { res.status(400).json({ error: "Image data is required" }); return; }
    const [created] = await db.insert(customBordersTable).values({
      name: String(name),
      imageData: String(imageData),
    }).returning();
    res.status(201).json(created);
  } catch (e) {
    req.log.error(e, "Failed to create custom border");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/custom-borders/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const deleted = await db.delete(customBordersTable).where(eq(customBordersTable.id, id)).returning();
    if (deleted.length === 0) { res.status(404).json({ error: "Border not found" }); return; }
    res.status(204).send();
  } catch (e) {
    req.log.error(e, "Failed to delete custom border");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
