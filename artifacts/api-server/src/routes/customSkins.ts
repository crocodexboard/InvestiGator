import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, customSkinsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/custom-skins", async (req, res) => {
  try {
    const skins = await db.select().from(customSkinsTable).orderBy(customSkinsTable.createdAt);
    res.json(skins);
  } catch (e) {
    req.log.error(e, "Failed to list custom skins");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/custom-skins", async (req, res) => {
  try {
    const { name, glowColor, glowEnabled, borderColor, bgGradientFrom, bgGradientTo, accessories } = req.body;
    if (!name) { res.status(400).json({ error: "Name is required" }); return; }
    const [created] = await db.insert(customSkinsTable).values({
      name: String(name),
      glowColor: String(glowColor || "#ff0000"),
      glowEnabled: Boolean(glowEnabled ?? true),
      borderColor: String(borderColor || "#ff0000"),
      bgGradientFrom: String(bgGradientFrom || "#0a0a0a"),
      bgGradientTo: String(bgGradientTo || "#1a0000"),
      accessories: Array.isArray(accessories) ? accessories.map(String) : [],
    }).returning();
    res.status(201).json(created);
  } catch (e) {
    req.log.error(e, "Failed to create custom skin");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/custom-skins/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const deleted = await db.delete(customSkinsTable).where(eq(customSkinsTable.id, id)).returning();
    if (deleted.length === 0) { res.status(404).json({ error: "Skin not found" }); return; }
    res.status(204).send();
  } catch (e) {
    req.log.error(e, "Failed to delete custom skin");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
