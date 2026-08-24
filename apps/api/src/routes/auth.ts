import { Router } from "express";
import { z } from "zod";
import type { User } from "@prisma/client";
import { prisma } from "../prisma";
import { verifyPassword } from "../lib/password";
import { checkLogin, recordFailure, recordSuccess } from "../lib/loginGuard";
import { audit } from "../lib/audit";
import { clientIp } from "../lib/analytics";
import { signToken, verifyToken } from "../lib/jwt";
import { env } from "../env";
import { authenticate } from "../middleware/auth";

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function publicUser(u: User) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatar: u.avatar,
    bio: u.bio,
  };
}

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { email, password } = parsed.data;
  const ip = clientIp(req.headers as Record<string, unknown>, req.socket.remoteAddress);
  const userAgent = req.get("user-agent") ?? null;

  // Too many wrong passwords from this address or against this account.
  const gate = checkLogin(ip, email);
  if (gate.locked) {
    await audit({ action: "login_locked", detail: email, ip, userAgent, success: false });
    res.setHeader("Retry-After", String(gate.retryAfter));
    return res.status(429).json({
      error: `অনেকবার ভুল হয়েছে। ${Math.ceil(gate.retryAfter / 60)} মিনিট পর আবার চেষ্টা করুন।`,
      retryAfter: gate.retryAfter,
    });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user && user.active && (await verifyPassword(password, user.password));

  if (!ok) {
    // One message for a wrong address and a wrong password alike, so this
    // cannot be used to find out which accounts exist.
    const after = recordFailure(ip, email);
    await audit({
      action: "login_failed",
      userId: user?.id ?? null,
      detail: email,
      ip,
      userAgent,
      success: false,
    });
    return res.status(401).json({
      error: "ভুল ইমেইল বা পাসওয়ার্ড",
      remaining: after.remaining,
    });
  }

  recordSuccess(ip, email);
  await audit({ action: "login", userId: user.id, ip, userAgent });

  const token = signToken({ sub: user.id, role: user.role });
  res.cookie(env.cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.cookieSecure,
    // A day, not a week: a stolen cookie is a much smaller window.
    maxAge: 24 * 60 * 60 * 1000,
    path: "/",
  });
  res.json({ user: publicUser(user) });
});

authRouter.post("/logout", async (req, res) => {
  const token = req.cookies?.[env.cookieName];
  if (token) {
    try {
      const payload = verifyToken(token);
      await audit({
        action: "logout",
        userId: payload.sub,
        ip: clientIp(req.headers as Record<string, unknown>, req.socket.remoteAddress),
        userAgent: req.get("user-agent") ?? null,
      });
    } catch {
      /* an expired token still logs out fine */
    }
  }
  res.clearCookie(env.cookieName, { path: "/" });
  res.json({ ok: true });
});

authRouter.get("/me", authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user || !user.active)
    return res.status(401).json({ error: "Unauthorized" });
  res.json({ user: publicUser(user) });
});
