import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import type { Account } from "@prisma/client";
import { prisma } from "../prisma";
import { hashPassword, verifyPassword } from "../lib/password";
import { env } from "../env";
import { authAccount, signAccountToken } from "../middleware/account";
import { PLACEMENTS, slotPrice, type Placement } from "../lib/adSlots";
import { findClash, validateTarget } from "../lib/adTargeting";
import { emitToStaff } from "../realtime";
import { UPLOAD_DIR } from "./admin";

export const accountRouter = Router();

/**
 * The creative formats an advertiser may upload, and the extension each is
 * saved under. The extension comes from this list, never from the uploaded
 * name: keeping the client's name let a file called x.html (sent as
 * image/png) be served back as a web page from the API's own address.
 */
const CREATIVE_EXT: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
};

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${CREATIVE_EXT[file.mimetype]}`);
  },
});
const upload = multer({
  storage,
  // Allow larger files for video creatives.
  limits: { fileSize: 30 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype in CREATIVE_EXT),
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

// Booked/occupied ranges for a slot (so the UI can show when it's free).
accountRouter.get("/slot-booked", authAccount, async (req, res) => {
  const { placement, targetType = "ALL", targetSlug } = req.query as Record<string, string>;
  if (!PLACEMENTS.includes(placement as Placement)) return res.json({ ranges: [] });
  if (!["ALL", "HOME", "CATEGORY", "ARTICLE"].includes(targetType))
    return res.json({ ranges: [] });
  const now = new Date();
  const ranges = await prisma.ad.findMany({
    where: {
      placement: placement as Placement,
      // The same slot on the same page — another page's booking does not block.
      targetType: targetType as never,
      targetSlug: targetSlug || null,
      status: { in: ["PENDING", "ACTIVE"] },
      endsAt: { gt: now },
    },
    select: { startsAt: true, endsAt: true },
    orderBy: { startsAt: "asc" },
  });
  res.json({ ranges });
});

// --- Advertiser: send a booking request ---
/**
 * A request, not a purchase: the newsroom calls the number given, agrees the
 * details and payment, and approves it — only then does it go live. The
 * advertiser says what (banner, link), where (which page or pages, and where
 * on the page) and for how long (a start date and a number of days).
 */
const bookSchema = z.object({
  name: z.string().trim().min(1).max(120),
  placement: z.enum(PLACEMENTS as [Placement, ...Placement[]]),
  imageUrl: z.string().url().max(500),
  linkUrl: z
    .string()
    .trim()
    .max(500)
    .regex(/^https?:\/\/\S+$/i, "লিংক https:// দিয়ে শুরু হতে হবে"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9০-৯][0-9০-৯\s-]{7,18}$/, "সঠিক মোবাইল নম্বর দিন"),
  targetType: z.enum(["ALL", "HOME", "CATEGORY", "ARTICLE"]),
  targetSlug: z.string().max(300).nullable().optional(),
  includeArticles: z.boolean().default(false),
  days: z.number().int().min(1).max(365),
  /** The day it should start, YYYY-MM-DD in Dhaka time; today if left out. */
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

const MS_PER_DAY = 24 * 3600 * 1000;

/** Midnight in Dhaka on a YYYY-MM-DD date, as an instant. */
function dhakaMidnight(date: string) {
  return new Date(`${date}T00:00:00+06:00`);
}

accountRouter.post("/ads", authAccount, async (req, res) => {
  const parsed = bookSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({
      error: parsed.error.issues[0]?.message?.match(/[\u0980-\u09FF]/)
        ? parsed.error.issues[0].message
        : "সব তথ্য ঠিকভাবে দিন",
    });
  const d = parsed.data;
  const price = slotPrice(d.placement);
  if (price === 0) return res.status(400).json({ error: "অবৈধ স্লট" });

  const target = await validateTarget(d.targetType, d.targetSlug);
  if (!target.ok) return res.status(400).json({ error: target.error });

  const now = new Date();
  let start = d.startDate ? dhakaMidnight(d.startDate) : now;
  if (isNaN(start.getTime())) return res.status(400).json({ error: "শুরুর তারিখ ঠিক নয়" });
  if (start.getTime() < now.getTime() - MS_PER_DAY)
    return res.status(400).json({ error: "শুরুর তারিখ অতীতে হতে পারে না" });
  if (start < now) start = now;
  const end = new Date(start.getTime() + d.days * MS_PER_DAY);

  // One slot on one page belongs to one advertiser at a time.
  const clash = await findClash({
    placement: d.placement,
    targetType: d.targetType,
    targetSlug: target.slug,
    start,
    end,
  });
  if (clash)
    return res.status(409).json({
      error: "এই পাতার এই জায়গাটি ওই সময়ে বুক করা আছে",
      availableFrom: clash.endsAt,
    });

  const ad = await prisma.ad.create({
    data: {
      name: d.name,
      imageUrl: d.imageUrl,
      linkUrl: d.linkUrl,
      placement: d.placement,
      targetType: d.targetType,
      targetSlug: target.slug,
      targetLabel: target.label,
      targetIncludesArticles: d.targetType === "CATEGORY" && d.includeArticles,
      customerPhone: d.phone,
      days: d.days,
      amount: price * d.days,
      startsAt: start,
      endsAt: end,
      status: "PENDING",
      active: false,
      paid: false,
      accountId: req.accountId,
    },
  });
  // The ads page and the bell pick the request up at once.
  emitToStaff("ads:booked", { id: ad.id });
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
      targetType: true,
      targetLabel: true,
      targetIncludesArticles: true,
      customerPhone: true,
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
