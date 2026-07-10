import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";
import { env } from "../env";

export interface AuthUser {
  id: string;
  role: string;
}

// Augment Express Request with a typed `user`.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[env.cookieName];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (!roles.includes(req.user.role))
      return res.status(403).json({ error: "Forbidden" });
    next();
  };
}
