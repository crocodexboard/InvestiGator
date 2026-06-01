import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, customBadgesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/custom-badges", async (req, res) => {
  try {
    const badges = await db.select().from(customBadgesTable).orderBy(customBadgesTable.createdAt);
    res.json(badges);
  } catch (e) {
    req.log.error(e, "Failed to list custom badges");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/custom-badges", async (req, res) => {
  try {
    const { name, color, accessory } = req.body;
    if (!name) { res.status(400).json({ error: "Name is required" }); return; }
    const [created] = await db.insert(customBadgesTable).values({
      name: String(name),
      color: String(color || "#ffd700"),
      accessory: String(accessory || "none"),
    }).returning();
    res.status(201).json(created);
  } catch (e) {
    req.log.error(e, "Failed to create custom badge");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/custom-badges/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const deleted = await db.delete(customBadgesTable).where(eq(customBadgesTable.id, id)).returning();
    if (deleted.length === 0) { res.status(404).json({ error: "Badge not found" }); return; }
    res.status(204).send();
  } catch (e) {
    req.log.error(e, "Failed to delete custom badge");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
