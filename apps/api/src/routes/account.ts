import { Router } from "express";
import { z } from "zod";
import path from "node:path";
import multer from "multer";
import type { Account } from "@prisma/client";
import { prisma } from "../prisma";
import { hashPassword, verifyPassword } from "../lib/password";
import { env } from "../env";
import { authAccount, signAccountToken } from "../middleware/account";
import { slotPrice } from "../lib/adSlots";
import { UPLOAD_DIR } from "./admin";

export const accountRouter = Router();

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith("image/")),
});

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

// --- Advertiser: image upload for ad creatives ---
accountRouter.post("/upload", authAccount, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "ছবি পাওয়া যায়নি" });
  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ url });
});

// --- Advertiser: book an ad slot (creates a PENDING order) ---
const bookSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  placement: z.enum(["HEADER", "SIDEBAR", "IN_ARTICLE", "FOOTER", "POPUP"]),
  imageUrl: z.string().min(1),
  linkUrl: z.string().min(1),
  days: z.number().int().min(1).max(365),
});

accountRouter.post("/ads", authAccount, async (req, res) => {
  const parsed = bookSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "সঠিক তথ্য দিন" });
  const d = parsed.data;
  const price = slotPrice(d.placement);
  if (price === 0) return res.status(400).json({ error: "অবৈধ স্লট" });

  const ad = await prisma.ad.create({
    data: {
      name: d.name?.trim() || `${d.placement} বিজ্ঞাপন`,
      imageUrl: d.imageUrl,
      linkUrl: d.linkUrl,
      placement: d.placement,
      days: d.days,
      amount: price * d.days,
      status: "PENDING",
      active: false,
      paid: false,
      accountId: req.accountId,
    },
  });
  res.status(201).json({ ad });
});

// --- Advertiser: my ads with live stats ---
accountRouter.get("/ads", authAccount, async (req, res) => {
  const ads = await prisma.ad.findMany({
    where: { accountId: req.accountId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      imageUrl: true,
      linkUrl: true,
      placement: true,
      status: true,
      amount: true,
      days: true,
      paid: true,
      impressions: true,
      clicks: true,
      startsAt: true,
      endsAt: true,
      createdAt: true,
    },
  });
  res.json({ ads });
});

// --- Advertiser: cancel a still-pending order ---
accountRouter.delete("/ads/:id", authAccount, async (req, res) => {
  await prisma.ad
    .deleteMany({
      where: { id: req.params.id, accountId: req.accountId, status: "PENDING" },
    })
    .catch(() => null);
  res.json({ ok: true });
});
