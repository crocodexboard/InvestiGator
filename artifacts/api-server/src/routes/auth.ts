import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { signToken, requireAuth } from "../lib/jwt";

const router: IRouter = Router();

router.post("/auth/register", async (req, res) => {
  try {
    const { robloxUsername, password } = req.body;
    if (!robloxUsername || !password) {
      res.status(400).json({ error: "robloxUsername and password are required" });
      return;
    }
    const username = String(robloxUsername).trim().slice(0, 30);
    if (username.length < 2) {
      res.status(400).json({ error: "Username must be at least 2 characters" });
      return;
    }
    if (String(password).length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters" });
      return;
    }

    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.robloxUsername, username))
      .limit(1);

    if (existing.length > 0) {
      res.status(409).json({ error: "That Roblox username is already registered" });
      return;
    }

    const passwordHash = await bcrypt.hash(String(password), 10);
    const [user] = await db
      .insert(usersTable)
      .values({ robloxUsername: username, passwordHash, status: "" })
      .returning();

    const token = signToken({ userId: user.id, robloxUsername: user.robloxUsername });
    res.status(201).json({
      token,
      user: { id: user.id, robloxUsername: user.robloxUsername, status: user.status },
    });
  } catch (e) {
    req.log.error(e, "Failed to register");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { robloxUsername, password } = req.body;
    if (!robloxUsername || !password) {
      res.status(400).json({ error: "robloxUsername and password are required" });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.robloxUsername, String(robloxUsername).trim()))
      .limit(1);

    if (!user) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }

    const valid = await bcrypt.compare(String(password), user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }

    const token = signToken({ userId: user.id, robloxUsername: user.robloxUsername });
    res.json({
      token,
      user: { id: user.id, robloxUsername: user.robloxUsername, status: user.status },
    });
  } catch (e) {
    req.log.error(e, "Failed to login");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/auth/me", requireAuth, async (req, res) => {
  try {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.user!.userId))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.json({ id: user.id, robloxUsername: user.robloxUsername, status: user.status });
  } catch (e) {
    req.log.error(e, "Failed to get me");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/auth/me", requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const updates: Record<string, unknown> = {};

    if (status !== undefined) {
      updates.status = String(status).slice(0, 60);
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "Nothing to update" });
      return;
    }

    const [updated] = await db
      .update(usersTable)
      .set(updates)
      .where(eq(usersTable.id, req.user!.userId))
      .returning();

    res.json({ id: updated.id, robloxUsername: updated.robloxUsername, status: updated.status });
  } catch (e) {
    req.log.error(e, "Failed to update me");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
