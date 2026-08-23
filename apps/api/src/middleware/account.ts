import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../env";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      accountId?: string;
    }
  }
}

interface AccountToken {
  sub: string;
  kind: "account";
}

export function signAccountToken(accountId: string): string {
  return jwt.sign({ sub: accountId, kind: "account" }, env.jwtSecret, {
    expiresIn: "30d",
  });
}

/**
 * Reads the signed-in reader's account id, or undefined when signed out.
 *
 * Unlike `authAccount` this never rejects — public endpoints use it to
 * personalise a response (whether *you* liked a donor) while staying open to
 * everyone else.
 */
export function readViewerAccount(req: Request): string | undefined {
  const token = req.cookies?.[env.accountCookieName];
  if (!token) return undefined;
  try {
    const payload = jwt.verify(token, env.jwtSecret) as AccountToken;
    return payload.kind === "account" ? payload.sub : undefined;
  } catch {
    return undefined;
  }
}

// Requires a valid advertiser-account cookie. Distinct from admin `authenticate`.
export function authAccount(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[env.accountCookieName];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const payload = jwt.verify(token, env.jwtSecret) as AccountToken;
    if (payload.kind !== "account") throw new Error("wrong token kind");
    req.accountId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
