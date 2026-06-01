import { Router, type IRouter } from "express";
import type { Request } from "../lib/jwt";
import { eq } from "drizzle-orm";
import { db, badgeInventoryTable, usersTable } from "@workspace/db";
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

router.get("/badge-inventory", requireAuth, async (req, res) => {
  try {
    const inventory = await db
      .select()
      .from(badgeInventoryTable)
      .where(eq(badgeInventoryTable.userId, req.user!.userId))
      .orderBy(badgeInventoryTable.grantedAt);
    res.json(inventory);
  } catch (e) {
    req.log.error(e, "Failed to list badge inventory");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/badge-inventory/user/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) { res.status(400).json({ error: "Invalid user ID" }); return; }

    const inventory = await db
      .select()
      .from(badgeInventoryTable)
      .where(eq(badgeInventoryTable.userId, userId))
      .orderBy(badgeInventoryTable.grantedAt);
    res.json(inventory);
  } catch (e) {
    req.log.error(e, "Failed to list badge inventory for user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await db
      .select({ id: usersTable.id, robloxUsername: usersTable.robloxUsername, status: usersTable.status, createdAt: usersTable.createdAt })
      .from(usersTable)
      .orderBy(usersTable.createdAt);
    res.json(users);
  } catch (e) {
    req.log.error(e, "Failed to list users");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/badge-inventory", async (req, res) => {
  try {
    if (!isMod(req)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const { userId, badgeName } = req.body;
    if (!userId || !badgeName) {
      res.status(400).json({ error: "userId and badgeName are required" });
      return;
    }

    const [item] = await db
      .insert(badgeInventoryTable)
      .values({ userId: parseInt(String(userId), 10), badgeName: String(badgeName) })
      .returning();
    res.status(201).json(item);
  } catch (e) {
    req.log.error(e, "Failed to give badge");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/badge-inventory/:id", async (req, res) => {
  try {
    if (!isMod(req)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

    const deleted = await db
      .delete(badgeInventoryTable)
      .where(eq(badgeInventoryTable.id, id))
      .returning();
    if (deleted.length === 0) { res.status(404).json({ error: "Not found" }); return; }
    res.status(204).send();
  } catch (e) {
    req.log.error(e, "Failed to delete badge inventory item");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
