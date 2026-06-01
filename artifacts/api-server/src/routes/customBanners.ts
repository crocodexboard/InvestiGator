import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, customBannersTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/custom-banners", async (req, res) => {
  try {
    const banners = await db.select().from(customBannersTable).orderBy(customBannersTable.createdAt);
    res.json(banners);
  } catch (e) {
    req.log.error(e, "Failed to list custom banners");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/custom-banners", async (req, res) => {
  try {
    const { name, patternType, primaryColor, secondaryColor, bgColor } = req.body;
    if (!name) { res.status(400).json({ error: "Name is required" }); return; }
    if (!patternType) { res.status(400).json({ error: "Pattern type is required" }); return; }
    const [created] = await db.insert(customBannersTable).values({
      name: String(name),
      patternType: String(patternType),
      primaryColor: String(primaryColor || "#ff0000"),
      secondaryColor: String(secondaryColor || "#8b0000"),
      bgColor: String(bgColor || "#0a0000"),
    }).returning();
    res.status(201).json(created);
  } catch (e) {
    req.log.error(e, "Failed to create custom banner");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/custom-banners/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const deleted = await db.delete(customBannersTable).where(eq(customBannersTable.id, id)).returning();
    if (deleted.length === 0) { res.status(404).json({ error: "Banner not found" }); return; }
    res.status(204).send();
  } catch (e) {
    req.log.error(e, "Failed to delete custom banner");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
