import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, eventsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/events", async (req, res) => {
  try {
    const events = await db.select().from(eventsTable).orderBy(eventsTable.createdAt);
    res.json(events);
  } catch (e) {
    req.log.error(e, "Failed to list events");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/events", async (req, res) => {
  try {
    const { title, description, imageData } = req.body;
    if (!title) { res.status(400).json({ error: "Title is required" }); return; }
    const [created] = await db.insert(eventsTable).values({
      title: String(title),
      description: String(description || ""),
      imageData: String(imageData || ""),
    }).returning();
    res.status(201).json(created);
  } catch (e) {
    req.log.error(e, "Failed to create event");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/events/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const { title, description, imageData } = req.body;
    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = String(title);
    if (description !== undefined) updates.description = String(description);
    if (imageData !== undefined) updates.imageData = String(imageData);
    const [updated] = await db.update(eventsTable).set(updates).where(eq(eventsTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Event not found" }); return; }
    res.json(updated);
  } catch (e) {
    req.log.error(e, "Failed to update event");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/events/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const deleted = await db.delete(eventsTable).where(eq(eventsTable.id, id)).returning();
    if (deleted.length === 0) { res.status(404).json({ error: "Event not found" }); return; }
    res.status(204).send();
  } catch (e) {
    req.log.error(e, "Failed to delete event");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
