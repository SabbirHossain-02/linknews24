import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/jwt";
import { prisma } from "../prisma";
import { env } from "../env";

export interface AuthUser {
  id: string;
  role: string;
  name: string;
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

/**
 * Who is signed in to the admin panel, as the database says now.
 *
 * The token only proves who someone is. Their role and whether the account is
 * still active are read fresh on every request, so a Super Admin who demotes or
 * switches someone off takes effect immediately rather than when that person's
 * cookie happens to expire.
 *
 * Reader/advertiser tokens are signed with the same secret but carry
 * `kind: "account"`; they are refused here outright.
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[env.cookieName];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  let payload: ReturnType<typeof verifyToken> & { kind?: string };
  try {
    payload = verifyToken(token);
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
  if (payload.kind || !payload.role)
    return res.status(401).json({ error: "Invalid token" });

  try {
    const user = await staffUser(payload.sub);
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/** The staff member behind a token, or null if gone or switched off. */
export async function staffUser(id: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, name: true, active: true },
  });
  if (!user || !user.active) return null;
  return { id: user.id, role: user.role, name: user.name };
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (!roles.includes(req.user.role))
      return res.status(403).json({ error: "Forbidden" });
    next();
  };
}

export const isSuper = (user?: { role: string }) => user?.role === "SUPER_ADMIN";
