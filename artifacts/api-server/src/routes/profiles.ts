import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, profilesTable } from "@workspace/db";
import { optionalAuth, requireAuth } from "../lib/jwt";

const router: IRouter = Router();

router.get("/profiles", async (req, res) => {
  try {
    const profiles = await db
      .select()
      .from(profilesTable)
      .orderBy(profilesTable.createdAt);
    res.json(profiles);
  } catch (e) {
    req.log.error(e, "Failed to list profiles");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/profiles", requireAuth, async (req, res) => {
  try {
    const { username, displayName, favoriteColor, bio, imageData, ageGroup, banner, traits } = req.body;

    if (!username || !displayName || !favoriteColor || !ageGroup) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const [created] = await db
      .insert(profilesTable)
      .values({
        userId: req.user!.userId,
        username: String(username).slice(0, 30),
        displayName: String(displayName).slice(0, 30),
        favoriteColor: String(favoriteColor),
        bio: String(bio || "").slice(0, 75),
        imageData: String(imageData || ""),
        ageGroup: String(ageGroup),
        badges: [],
        traits: Array.isArray(traits) ? traits.slice(0, 10) : [],
        skin: "Red",
        banner: banner ? String(banner) : null,
      })
      .returning();

    res.status(201).json(created);
  } catch (e) {
    req.log.error(e, "Failed to create profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/profiles/:id", async (req, res) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }

    const deleted = await db
      .delete(profilesTable)
      .where(eq(profilesTable.id, id))
      .returning();

    if (deleted.length === 0) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    res.status(204).send();
  } catch (e) {
    req.log.error(e, "Failed to delete profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/profiles/:id", optionalAuth, async (req, res) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid ID" });
      return;
    }

    const existingRows = await db
      .select()
      .from(profilesTable)
      .where(eq(profilesTable.id, id))
      .limit(1);

    if (existingRows.length === 0) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    const existing = existingRows[0]!;

    const { skin, badges, banner, boarder, username, displayName, favoriteColor, bio, imageData, ageGroup, traits } = req.body;
    const updates: Record<string, unknown> = {};

    const isOwner = req.user && existing.userId === req.user.userId;

    if (skin !== undefined) updates.skin = String(skin);
    if (badges !== undefined && Array.isArray(badges)) updates.badges = badges;
    if (banner !== undefined) updates.banner = banner === null ? null : String(banner);
    if (boarder !== undefined) updates.boarder = boarder === null ? null : String(boarder);

    if (isOwner) {
      if (username !== undefined) updates.username = String(username).slice(0, 30);
      if (displayName !== undefined) updates.displayName = String(displayName).slice(0, 30);
      if (favoriteColor !== undefined) updates.favoriteColor = String(favoriteColor);
      if (bio !== undefined) updates.bio = String(bio).slice(0, 75);
      if (imageData !== undefined) updates.imageData = String(imageData);
      if (ageGroup !== undefined) updates.ageGroup = String(ageGroup);
      if (traits !== undefined && Array.isArray(traits)) updates.traits = traits.slice(0, 10);
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No valid fields to update" });
      return;
    }

    const [updated] = await db
      .update(profilesTable)
      .set(updates)
      .where(eq(profilesTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }

    res.json(updated);
  } catch (e) {
    req.log.error(e, "Failed to update profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
