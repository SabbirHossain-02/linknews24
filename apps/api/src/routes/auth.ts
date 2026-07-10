import { Router } from "express";
import { z } from "zod";
import type { User } from "@prisma/client";
import { prisma } from "../prisma";
import { verifyPassword } from "../lib/password";
import { signToken } from "../lib/jwt";
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
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active)
    return res.status(401).json({ error: "ভুল ইমেইল বা পাসওয়ার্ড" });

  const ok = await verifyPassword(password, user.password);
  if (!ok) return res.status(401).json({ error: "ভুল ইমেইল বা পাসওয়ার্ড" });

  const token = signToken({ sub: user.id, role: user.role });
  res.cookie(env.cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.cookieSecure,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
  res.json({ user: publicUser(user) });
});

authRouter.post("/logout", (_req, res) => {
  res.clearCookie(env.cookieName, { path: "/" });
  res.json({ ok: true });
});

authRouter.get("/me", authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user || !user.active)
    return res.status(401).json({ error: "Unauthorized" });
  res.json({ user: publicUser(user) });
});
