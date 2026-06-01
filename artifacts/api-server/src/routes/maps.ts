import { Router, type IRouter } from "express";
import type { Request } from "../lib/jwt";
import { eq, and } from "drizzle-orm";
import { db, mapsTable, pinpointsTable, userLocationsTable, usersTable, profilesTable } from "@workspace/db";
import { requireAuth } from "../lib/jwt";

const MOD_CODE = "No_Jayii0607";
const router: IRouter = Router();

function isMod(req: Request): boolean {
  const headerCode = req.headers["x-mod-code"];
  return (
    req.body?.accessCode === MOD_CODE ||
    (Array.isArray(headerCode) ? headerCode[0] : headerCode) === MOD_CODE
  );
}

router.get("/maps", async (req, res) => {
  try {
    const maps = await db.select().from(mapsTable).orderBy(mapsTable.createdAt);
    const pinpoints = await db.select().from(pinpointsTable);

    const locations = await db
      .select({
        id: userLocationsTable.id,
        userId: userLocationsTable.userId,
        pinpointId: userLocationsTable.pinpointId,
        description: userLocationsTable.description,
        robloxUsername: usersTable.robloxUsername,
      })
      .from(userLocationsTable)
      .innerJoin(usersTable, eq(userLocationsTable.userId, usersTable.id));

    const profilesByUser = await db
      .select({ userId: profilesTable.userId, displayName: profilesTable.displayName })
      .from(profilesTable)
      .where(eq(profilesTable.userId, profilesTable.userId));

    const displayByUserId: Record<number, string> = {};
    for (const p of profilesByUser) {
      if (p.userId && !displayByUserId[p.userId]) {
        displayByUserId[p.userId] = p.displayName;
      }
    }

    const result = maps.map((m) => ({
      ...m,
      pinpoints: pinpoints
        .filter((p) => p.mapId === m.id)
        .map((p) => ({
          ...p,
          residents: locations
            .filter((l) => l.pinpointId === p.id)
            .map((l) => ({
              userId: l.userId,
              robloxUsername: l.robloxUsername,
              displayName: displayByUserId[l.userId] ?? l.robloxUsername,
              description: l.description,
            })),
        })),
    }));

    res.json(result);
  } catch (e) {
    req.log.error(e, "Failed to list maps");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/maps", async (req, res) => {
  try {
    if (!isMod(req)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const { name, imageData } = req.body;
    if (!name) {
      res.status(400).json({ error: "name is required" });
      return;
    }
    const [map] = await db
      .insert(mapsTable)
      .values({ name: String(name).slice(0, 60), imageData: String(imageData || "") })
      .returning();
    res.status(201).json({ ...map, pinpoints: [] });
  } catch (e) {
    req.log.error(e, "Failed to create map");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/maps/:id", async (req, res) => {
  try {
    if (!isMod(req)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

    const { name, imageData } = req.body;
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = String(name).slice(0, 60);
    if (imageData !== undefined) updates.imageData = String(imageData);

    if (Object.keys(updates).length === 0) { res.status(400).json({ error: "Nothing to update" }); return; }

    const [updated] = await db.update(mapsTable).set(updates).where(eq(mapsTable.id, id)).returning();
    if (!updated) { res.status(404).json({ error: "Map not found" }); return; }
    res.json(updated);
  } catch (e) {
    req.log.error(e, "Failed to update map");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/maps/:id", async (req, res) => {
  try {
    if (!isMod(req)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
    const deleted = await db.delete(mapsTable).where(eq(mapsTable.id, id)).returning();
    if (deleted.length === 0) { res.status(404).json({ error: "Map not found" }); return; }
    res.status(204).send();
  } catch (e) {
    req.log.error(e, "Failed to delete map");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/maps/:mapId/pinpoints", async (req, res) => {
  try {
    if (!isMod(req)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const mapId = parseInt(req.params.mapId, 10);
    if (isNaN(mapId)) { res.status(400).json({ error: "Invalid map ID" }); return; }

    const { type, name, description, imageData, xPercent, yPercent } = req.body;
    if (!name) { res.status(400).json({ error: "name is required" }); return; }

    const [pin] = await db
      .insert(pinpointsTable)
      .values({
        mapId,
        type: (type === "info" ? "info" : "live"),
        name: String(name).slice(0, 60),
        description: String(description || "").slice(0, 500),
        imageData: String(imageData || ""),
        xPercent: parseFloat(xPercent) || 50,
        yPercent: parseFloat(yPercent) || 50,
      })
      .returning();
    res.status(201).json(pin);
  } catch (e) {
    req.log.error(e, "Failed to create pinpoint");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/maps/:mapId/pinpoints/:pinId", async (req, res) => {
  try {
    if (!isMod(req)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const mapId = parseInt(req.params.mapId, 10);
    const pinId = parseInt(req.params.pinId, 10);
    if (isNaN(mapId) || isNaN(pinId)) { res.status(400).json({ error: "Invalid ID" }); return; }

    const { name, description, imageData, xPercent, yPercent } = req.body;
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = String(name).slice(0, 60);
    if (description !== undefined) updates.description = String(description).slice(0, 500);
    if (imageData !== undefined) updates.imageData = String(imageData);
    if (xPercent !== undefined) updates.xPercent = parseFloat(xPercent);
    if (yPercent !== undefined) updates.yPercent = parseFloat(yPercent);

    if (Object.keys(updates).length === 0) { res.status(400).json({ error: "Nothing to update" }); return; }

    const [updated] = await db
      .update(pinpointsTable)
      .set(updates)
      .where(and(eq(pinpointsTable.id, pinId), eq(pinpointsTable.mapId, mapId)))
      .returning();
    if (!updated) { res.status(404).json({ error: "Pinpoint not found" }); return; }
    res.json(updated);
  } catch (e) {
    req.log.error(e, "Failed to update pinpoint");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/maps/:mapId/pinpoints/:pinId", async (req, res) => {
  try {
    if (!isMod(req)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const mapId = parseInt(req.params.mapId, 10);
    const pinId = parseInt(req.params.pinId, 10);
    if (isNaN(mapId) || isNaN(pinId)) { res.status(400).json({ error: "Invalid ID" }); return; }

    const deleted = await db
      .delete(pinpointsTable)
      .where(and(eq(pinpointsTable.id, pinId), eq(pinpointsTable.mapId, mapId)))
      .returning();
    if (deleted.length === 0) { res.status(404).json({ error: "Pinpoint not found" }); return; }
    res.status(204).send();
  } catch (e) {
    req.log.error(e, "Failed to delete pinpoint");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/maps/:mapId/pinpoints/:pinId/live-here", requireAuth, async (req, res) => {
  try {
    const mapId = parseInt(String(req.params.mapId), 10);
    const pinId = parseInt(String(req.params.pinId), 10);
    if (isNaN(mapId) || isNaN(pinId)) { res.status(400).json({ error: "Invalid ID" }); return; }

    const [pin] = await db
      .select()
      .from(pinpointsTable)
      .where(and(eq(pinpointsTable.id, pinId), eq(pinpointsTable.mapId, mapId)))
      .limit(1);

    if (!pin) { res.status(404).json({ error: "Pinpoint not found" }); return; }
    if (pin.type !== "live") { res.status(400).json({ error: "Cannot live at an info point" }); return; }

    const userId = req.user!.userId;
    const { description } = req.body;

    await db
      .delete(userLocationsTable)
      .where(eq(userLocationsTable.userId, userId));

    const [loc] = await db
      .insert(userLocationsTable)
      .values({
        userId,
        pinpointId: pinId,
        description: String(description || "").slice(0, 500),
      })
      .returning();
    res.status(201).json(loc);
  } catch (e) {
    req.log.error(e, "Failed to live here");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/user-location", requireAuth, async (req, res) => {
  try {
    await db
      .delete(userLocationsTable)
      .where(eq(userLocationsTable.userId, req.user!.userId));
    res.status(204).send();
  } catch (e) {
    req.log.error(e, "Failed to remove location");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
