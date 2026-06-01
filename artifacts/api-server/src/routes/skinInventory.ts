import { Router, type IRouter } from "express";
import type { Request } from "../lib/jwt";
import { eq } from "drizzle-orm";
import { db, skinInventoryTable, usersTable } from "@workspace/db";
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

router.get("/skin-inventory", requireAuth, async (req, res) => {
  try {
    const inventory = await db
      .select()
      .from(skinInventoryTable)
      .where(eq(skinInventoryTable.userId, req.user!.userId))
      .orderBy(skinInventoryTable.grantedAt);
    res.json(inventory);
  } catch (e) {
    req.log.error(e, "Failed to list skin inventory");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/skin-inventory/user/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) { res.status(400).json({ error: "Invalid user ID" }); return; }

    const inventory = await db
      .select()
      .from(skinInventoryTable)
      .where(eq(skinInventoryTable.userId, userId))
      .orderBy(skinInventoryTable.grantedAt);
    res.json(inventory);
  } catch (e) {
    req.log.error(e, "Failed to list skin inventory for user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/skin-inventory", async (req, res) => {
  try {
    if (!isMod(req)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const { userId, skinName } = req.body;
    if (!userId || !skinName) {
      res.status(400).json({ error: "userId and skinName are required" });
      return;
    }

    const [item] = await db
      .insert(skinInventoryTable)
      .values({ userId: parseInt(String(userId), 10), skinName: String(skinName) })
      .returning();
    res.status(201).json(item);
  } catch (e) {
    req.log.error(e, "Failed to give skin");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/skin-inventory/:id", async (req, res) => {
  try {
    if (!isMod(req)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

    const deleted = await db
      .delete(skinInventoryTable)
      .where(eq(skinInventoryTable.id, id))
      .returning();
    if (deleted.length === 0) { res.status(404).json({ error: "Not found" }); return; }
    res.status(204).send();
  } catch (e) {
    req.log.error(e, "Failed to delete skin inventory item");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
