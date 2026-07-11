import { Router } from "express";
import { z } from "zod";
import type { Account } from "@prisma/client";
import { prisma } from "../prisma";
import { hashPassword, verifyPassword } from "../lib/password";
import { env } from "../env";
import { authAccount, signAccountToken } from "../middleware/account";

export const accountRouter = Router();

function publicAccount(a: Account) {
  return {
    id: a.id,
    name: a.name,
    email: a.email,
    phone: a.phone,
    avatar: a.avatar,
    bio: a.bio,
    city: a.city,
    joinedAt: a.createdAt,
  };
}

function setAccountCookie(res: import("express").Response, accountId: string) {
  res.cookie(env.accountCookieName, signAccountToken(accountId), {
    httpOnly: true,
    sameSite: "lax",
    secure: env.cookieSecure,
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

accountRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "সঠিক তথ্য দিন" });
  const { name, email, password } = parsed.data;

  const existing = await prisma.account.findUnique({ where: { email } });
  if (existing)
    return res.status(409).json({ error: "এই ইমেইলে আগে থেকেই অ্যাকাউন্ট আছে" });

  const account = await prisma.account.create({
    data: { name, email, password: await hashPassword(password) },
  });
  setAccountCookie(res, account.id);
  res.status(201).json({ user: publicAccount(account) });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

accountRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const { email, password } = parsed.data;

  const account = await prisma.account.findUnique({ where: { email } });
  if (!account) return res.status(401).json({ error: "ভুল ইমেইল বা পাসওয়ার্ড" });
  const ok = await verifyPassword(password, account.password);
  if (!ok) return res.status(401).json({ error: "ভুল ইমেইল বা পাসওয়ার্ড" });

  setAccountCookie(res, account.id);
  res.json({ user: publicAccount(account) });
});

accountRouter.post("/logout", (_req, res) => {
  res.clearCookie(env.accountCookieName, { path: "/" });
  res.json({ ok: true });
});

accountRouter.get("/me", authAccount, async (req, res) => {
  const account = await prisma.account.findUnique({ where: { id: req.accountId } });
  if (!account) return res.status(401).json({ error: "Unauthorized" });
  res.json({ user: publicAccount(account) });
});

const updateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  phone: z.string().max(30).nullable().optional(),
  city: z.string().max(80).nullable().optional(),
  bio: z.string().max(400).nullable().optional(),
  avatar: z.string().nullable().optional(),
});

accountRouter.patch("/me", authAccount, async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const account = await prisma.account.update({
    where: { id: req.accountId },
    data: parsed.data,
  });
  res.json({ user: publicAccount(account) });
});
