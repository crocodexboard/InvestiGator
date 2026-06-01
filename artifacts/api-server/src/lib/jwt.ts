import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

export type { Request };

export interface JwtPayload {
  userId: number;
  robloxUsername: string;
}

declare module "express" {
  interface Request {
    user?: JwtPayload;
  }
}

function getSecret(): string {
  return process.env["SESSION_SECRET"] || "investigator-ids-secret";
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: "30d" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getSecret()) as JwtPayload;
  } catch {
    return null;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers["authorization"];
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = auth.slice(7);
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
  req.user = payload;
  next();
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const auth = req.headers["authorization"];
  if (auth?.startsWith("Bearer ")) {
    const token = auth.slice(7);
    const payload = verifyToken(token);
    if (payload) req.user = payload;
  }
  next();
}
