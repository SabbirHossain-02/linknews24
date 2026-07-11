import { Router } from "express";
import { z } from "zod";
import path from "node:path";
import fs from "node:fs";
import multer from "multer";
import { prisma } from "../prisma";
import { requireRole } from "../middleware/auth";
import {
  CAN_DIRECTORY,
  CAN_MANAGE,
  CAN_MODERATE,
  CAN_PUBLISH,
  CAN_WRITE,
  slugify,
} from "../lib/roles";
import { hashPassword } from "../lib/password";
import { emitChange, emitAnalytics } from "../realtime";

export const adminRouter = Router();

// Broadcast a realtime "content changed" event after any successful mutation.
adminRouter.use((req, res, next) => {
  if (req.method !== "GET") {
    res.on("finish", () => {
      if (res.statusCode < 400) emitChange({ path: req.path });
    });
  }
  next();
});

// --- Media upload (images) ---
export const UPLOAD_DIR = path.join(process.cwd(), "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    cb(null, file.mimetype.startsWith("image/")),
});

adminRouter.post(
  "/media/upload",
  requireRole(...CAN_WRITE),
  upload.single("file"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "ছবি পাওয়া যায়নি" });
    const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    await prisma.media.create({
      data: { url, type: "IMAGE", uploadedById: req.user!.id },
    });
    res.json({ url });
  },
);

// Larger limit + PDF-only filter for e-paper editions.
const pdfUpload = multer({
  storage,
  limits: { fileSize: 40 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype === "application/pdf"),
});

adminRouter.post(
  "/epaper/upload",
  requireRole(...CAN_WRITE),
  pdfUpload.single("file"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "PDF পাওয়া যায়নি" });
    const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    await prisma.media.create({
      data: { url, type: "PDF", uploadedById: req.user!.id },
    });
    res.json({ url });
  },
);

const articleSchema = z.object({
  title: z.string().min(1),
  titleEn: z.string().default(""),
  slug: z.string().optional(),
  excerpt: z.string().default(""),
  excerptEn: z.string().default(""),
  body: z.string().default(""),
  bodyEn: z.string().default(""),
  categoryId: z.string().min(1),
  authorName: z.string().optional(),
  imageTone: z.string().default("navy"),
  featuredImage: z.string().nullable().optional(),
  isBreaking: z.boolean().default(false),
  featured: z.boolean().default(false),
  isHero: z.boolean().default(false),
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED"]).default("DRAFT"),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

// Turn free-typed tag names into connectOrCreate ops (dedup by slug).
function tagConnectOrCreate(names?: string[]) {
  const unique = [
    ...new Map(
      (names ?? [])
        .map((n) => n.trim())
        .filter(Boolean)
        .map((n) => [slugify(n), n]),
    ),
  ];
  return unique.map(([slug, name]) => ({
    where: { slug },
    create: { name, nameEn: name, slug },
  }));
}

// Only one article can be the hero — unset it on all others.
async function clearOtherHeroes(keepId: string) {
  await prisma.article.updateMany({
    where: { isHero: true, id: { not: keepId } },
    data: { isHero: false },
  });
}

async function uniqueSlug(desired: string, excludeId?: string): Promise<string> {
  const base = slugify(desired);
  let slug = base;
  let n = 1;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    n += 1;
    slug = `${base}-${n}`;
  }
}

// --- Article list (all statuses, filtered + paginated) ---
adminRouter.get("/articles", async (req, res) => {
  const {
    status,
    category,
    q,
    page = "1",
    limit = "20",
  } = req.query as Record<string, string>;

  const take = Math.min(Number(limit) || 20, 50);
  const currentPage = Math.max(Number(page) || 1, 1);
  const skip = (currentPage - 1) * take;

  const where = {
    status: status ? (status as never) : undefined,
    categoryId: category || undefined,
    OR: q
      ? [
          { title: { contains: q, mode: "insensitive" as const } },
          { titleEn: { contains: q, mode: "insensitive" as const } },
        ]
      : undefined,
  };

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: {
        category: { select: { name: true, nameEn: true, slug: true } },
        author: { select: { name: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take,
    }),
    prisma.article.count({ where }),
  ]);

  res.json({ articles, total, page: currentPage, limit: take });
});

// --- Single article ---
adminRouter.get("/articles/:id", async (req, res) => {
  const article = await prisma.article.findUnique({
    where: { id: req.params.id },
    include: { tags: { select: { name: true } } },
  });
  if (!article) return res.status(404).json({ error: "Not found" });
  res.json({ article });
});

// --- Create ---
adminRouter.post("/articles", requireRole(...CAN_WRITE), async (req, res) => {
  const parsed = articleSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: "Invalid input", issues: parsed.error.issues });
  const data = parsed.data;

  // Reporters cannot publish.
  const canPublish = CAN_PUBLISH.includes(req.user!.role);
  const status = data.status === "PUBLISHED" && !canPublish ? "DRAFT" : data.status;

  const slug = await uniqueSlug(data.slug || data.titleEn || data.title);

  const article = await prisma.article.create({
    data: {
      title: data.title,
      titleEn: data.titleEn,
      slug,
      excerpt: data.excerpt,
      excerptEn: data.excerptEn,
      body: data.body,
      bodyEn: data.bodyEn,
      categoryId: data.categoryId,
      imageTone: data.imageTone,
      featuredImage: data.featuredImage ?? null,
      isBreaking: canPublish ? data.isBreaking : false,
      featured: canPublish ? data.featured : false,
      isHero: canPublish ? data.isHero : false,
      status,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
      authorId: req.user!.id,
      authorName: data.authorName?.trim() || null,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      tags: { connectOrCreate: tagConnectOrCreate(data.tags) },
    },
  });
  if (article.isHero) await clearOtherHeroes(article.id);
  res.status(201).json({ article });
});

// --- Update ---
adminRouter.put("/articles/:id", requireRole(...CAN_WRITE), async (req, res) => {
  const existing = await prisma.article.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Not found" });

  const canPublish = CAN_PUBLISH.includes(req.user!.role);
  // Reporters may only edit their own drafts.
  if (!canPublish && existing.authorId !== req.user!.id)
    return res.status(403).json({ error: "Forbidden" });

  const parsed = articleSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: "Invalid input", issues: parsed.error.issues });
  const data = parsed.data;

  const status = data.status === "PUBLISHED" && !canPublish ? "DRAFT" : data.status;
  const slug = data.slug
    ? await uniqueSlug(data.slug, existing.id)
    : existing.slug;

  const article = await prisma.article.update({
    where: { id: existing.id },
    data: {
      title: data.title,
      titleEn: data.titleEn,
      slug,
      excerpt: data.excerpt,
      excerptEn: data.excerptEn,
      body: data.body,
      bodyEn: data.bodyEn,
      categoryId: data.categoryId,
      imageTone: data.imageTone,
      featuredImage: data.featuredImage ?? null,
      isBreaking: canPublish ? data.isBreaking : existing.isBreaking,
      featured: canPublish ? data.featured : existing.featured,
      isHero: canPublish ? data.isHero : existing.isHero,
      status,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
      authorName: data.authorName?.trim() || null,
      publishedAt:
        status === "PUBLISHED"
          ? existing.publishedAt ?? new Date()
          : status === "DRAFT"
            ? null
            : existing.publishedAt,
      tags: { set: [], connectOrCreate: tagConnectOrCreate(data.tags) },
    },
  });
  if (article.isHero) await clearOtherHeroes(article.id);
  res.json({ article });
});

// --- Quick flag toggles (publish / breaking / featured) ---
const flagsSchema = z.object({
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED"]).optional(),
  isBreaking: z.boolean().optional(),
  featured: z.boolean().optional(),
});

adminRouter.patch(
  "/articles/:id/flags",
  requireRole(...CAN_PUBLISH),
  async (req, res) => {
    const existing = await prisma.article.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) return res.status(404).json({ error: "Not found" });

    const parsed = flagsSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const { status, isBreaking, featured } = parsed.data;

    const article = await prisma.article.update({
      where: { id: existing.id },
      data: {
        isBreaking: isBreaking ?? existing.isBreaking,
        featured: featured ?? existing.featured,
        status: status ?? existing.status,
        publishedAt:
          status === "PUBLISHED"
            ? existing.publishedAt ?? new Date()
            : status === "DRAFT"
              ? null
              : existing.publishedAt,
      },
    });
    res.json({ article });
  },
);

// --- Delete ---
adminRouter.delete(
  "/articles/:id",
  requireRole(...CAN_PUBLISH),
  async (req, res) => {
    await prisma.article
      .delete({ where: { id: req.params.id } })
      .catch(() => null);
    res.json({ ok: true });
  },
);

// ===================== LIVE TV =====================
adminRouter.get("/livetv", async (_req, res) => {
  const live = await prisma.liveTvSetting.upsert({
    where: { id: "live-tv" },
    update: {},
    create: { id: "live-tv" },
  });
  res.json({ live });
});

const liveSchema = z.object({
  streamUrl: z.string().default(""),
  active: z.boolean().default(false),
  title: z.string().default("লাইভ টিভি"),
  titleEn: z.string().default("Live TV"),
});

adminRouter.put("/livetv", requireRole(...CAN_MANAGE), async (req, res) => {
  const parsed = liveSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const live = await prisma.liveTvSetting.upsert({
    where: { id: "live-tv" },
    update: parsed.data,
    create: { id: "live-tv", ...parsed.data },
  });
  res.json({ live });
});

// ===================== BREAKING TICKER =====================
adminRouter.get("/breaking", async (_req, res) => {
  const items = await prisma.breakingItem.findMany({
    orderBy: { order: "asc" },
  });
  res.json({ items });
});

const breakingSchema = z.object({
  text: z.string().min(1),
  textEn: z.string().default(""),
  active: z.boolean().default(true),
  order: z.number().int().default(0),
});

adminRouter.post("/breaking", requireRole(...CAN_PUBLISH), async (req, res) => {
  const parsed = breakingSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const count = await prisma.breakingItem.count();
  const item = await prisma.breakingItem.create({
    data: { ...parsed.data, order: parsed.data.order || count },
  });
  res.status(201).json({ item });
});

adminRouter.put("/breaking/:id", requireRole(...CAN_PUBLISH), async (req, res) => {
  const parsed = breakingSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const item = await prisma.breakingItem
    .update({ where: { id: req.params.id }, data: parsed.data })
    .catch(() => null);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json({ item });
});

adminRouter.delete("/breaking/:id", requireRole(...CAN_PUBLISH), async (req, res) => {
  await prisma.breakingItem.delete({ where: { id: req.params.id } }).catch(() => null);
  res.json({ ok: true });
});

// ===================== CATEGORIES =====================
adminRouter.get("/categories", async (_req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { articles: true } } },
  });
  res.json({ categories });
});

const categorySchema = z.object({
  name: z.string().min(1),
  nameEn: z.string().min(1),
  slug: z.string().optional(),
  visible: z.boolean().default(true),
  order: z.number().int().optional(),
});

adminRouter.post("/categories", requireRole(...CAN_PUBLISH), async (req, res) => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const d = parsed.data;
  const slug = await (async () => {
    const base = slugify(d.slug || d.nameEn || d.name);
    let s = base;
    let n = 1;
    while (await prisma.category.findUnique({ where: { slug: s } })) {
      n += 1;
      s = `${base}-${n}`;
    }
    return s;
  })();
  const count = await prisma.category.count();
  const category = await prisma.category.create({
    data: {
      name: d.name,
      nameEn: d.nameEn,
      slug,
      visible: d.visible,
      order: d.order ?? count,
    },
  });
  res.status(201).json({ category });
});

adminRouter.put("/categories/:id", requireRole(...CAN_PUBLISH), async (req, res) => {
  const parsed = categorySchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const category = await prisma.category
    .update({
      where: { id: req.params.id },
      data: {
        name: parsed.data.name,
        nameEn: parsed.data.nameEn,
        visible: parsed.data.visible,
        order: parsed.data.order,
      },
    })
    .catch(() => null);
  if (!category) return res.status(404).json({ error: "Not found" });
  res.json({ category });
});

adminRouter.delete("/categories/:id", requireRole(...CAN_MANAGE), async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch {
    res.status(400).json({ error: "এই ক্যাটাগরিতে আর্টিকেল আছে — মুছতে পারবেন না" });
  }
});

// ===================== HOMEPAGE BUILDER =====================
adminRouter.get("/homepage", async (_req, res) => {
  const sections = await prisma.homepageSection.findMany({
    orderBy: { order: "asc" },
    include: { category: { select: { name: true, nameEn: true, slug: true } } },
  });
  res.json({ sections });
});

const sectionSchema = z.object({
  categoryId: z.string().min(1),
  cardCount: z.number().int().min(2).max(12).default(6),
  visible: z.boolean().default(true),
  order: z.number().int().optional(),
});

adminRouter.post("/homepage", requireRole(...CAN_MANAGE), async (req, res) => {
  const parsed = sectionSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const count = await prisma.homepageSection.count();
  const section = await prisma.homepageSection.create({
    data: {
      type: "ROW",
      categoryId: parsed.data.categoryId,
      cardCount: parsed.data.cardCount,
      visible: parsed.data.visible,
      order: parsed.data.order ?? count,
    },
  });
  res.status(201).json({ section });
});

adminRouter.put("/homepage/:id", requireRole(...CAN_MANAGE), async (req, res) => {
  const parsed = sectionSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const section = await prisma.homepageSection
    .update({ where: { id: req.params.id }, data: parsed.data })
    .catch(() => null);
  if (!section) return res.status(404).json({ error: "Not found" });
  res.json({ section });
});

adminRouter.delete("/homepage/:id", requireRole(...CAN_MANAGE), async (req, res) => {
  await prisma.homepageSection.delete({ where: { id: req.params.id } }).catch(() => null);
  res.json({ ok: true });
});

// A category's articles for homepage ordering (lead + manual order)
adminRouter.get("/section-articles/:categoryId", async (req, res) => {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED", categoryId: req.params.categoryId },
    orderBy: [
      { sectionLead: "desc" },
      { homeRank: { sort: "asc", nulls: "last" } },
      { publishedAt: "desc" },
    ],
    take: 12,
    select: { id: true, title: true, sectionLead: true },
  });
  res.json({ articles });
});

const sectionOrderSchema = z.object({
  orderedIds: z.array(z.string()),
  leadId: z.string().nullable().optional(),
});

adminRouter.put(
  "/section-articles/:categoryId",
  requireRole(...CAN_PUBLISH),
  async (req, res) => {
    const parsed = sectionOrderSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const categoryId = req.params.categoryId;

    // reset lead in this category, then apply order + lead
    await prisma.article.updateMany({
      where: { categoryId },
      data: { sectionLead: false },
    });
    await Promise.all(
      parsed.data.orderedIds.map((id, i) =>
        prisma.article
          .update({ where: { id }, data: { homeRank: i } })
          .catch(() => null),
      ),
    );
    if (parsed.data.leadId) {
      await prisma.article
        .update({ where: { id: parsed.data.leadId }, data: { sectionLead: true } })
        .catch(() => null);
    }
    res.json({ ok: true });
  },
);

// ===================== USERS & ROLES (super admin) =====================
const ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR", "REPORTER", "MODERATOR"] as const;

adminRouter.get("/users", requireRole("SUPER_ADMIN"), async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });
  res.json({ users });
});

const userCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(ROLES),
});

adminRouter.post("/users", requireRole("SUPER_ADMIN"), async (req, res) => {
  const parsed = userCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const exists = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (exists) return res.status(400).json({ error: "এই ইমেইল আগে থেকেই আছে" });
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: await hashPassword(parsed.data.password),
      role: parsed.data.role,
    },
    select: { id: true, name: true, email: true, role: true, active: true },
  });
  res.status(201).json({ user });
});

const userUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(ROLES).optional(),
  active: z.boolean().optional(),
  password: z.string().min(6).optional(),
});

adminRouter.put("/users/:id", requireRole("SUPER_ADMIN"), async (req, res) => {
  const parsed = userUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.password) data.password = await hashPassword(parsed.data.password);
  const user = await prisma.user
    .update({
      where: { id: req.params.id },
      data,
      select: { id: true, name: true, email: true, role: true, active: true },
    })
    .catch(() => null);
  if (!user) return res.status(404).json({ error: "Not found" });
  res.json({ user });
});

adminRouter.delete("/users/:id", requireRole("SUPER_ADMIN"), async (req, res) => {
  if (req.params.id === req.user!.id)
    return res.status(400).json({ error: "নিজেকে মুছতে পারবেন না" });
  await prisma.user.delete({ where: { id: req.params.id } }).catch(() => null);
  res.json({ ok: true });
});

// ===================== MEDIA LIBRARY =====================
adminRouter.get("/media", async (_req, res) => {
  const media = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  res.json({ media });
});

adminRouter.delete("/media/:id", requireRole(...CAN_WRITE), async (req, res) => {
  const item = await prisma.media
    .delete({ where: { id: req.params.id } })
    .catch(() => null);
  if (item) {
    const file = item.url.split("/uploads/")[1];
    if (file) fs.promises.rm(path.join(UPLOAD_DIR, file)).catch(() => {});
  }
  res.json({ ok: true });
});

// ===================== SUBSCRIBERS (newsletter) =====================
adminRouter.get("/subscribers", async (_req, res) => {
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json({ subscribers });
});

adminRouter.delete("/subscribers/:id", requireRole(...CAN_MANAGE), async (req, res) => {
  await prisma.subscriber.delete({ where: { id: req.params.id } }).catch(() => null);
  res.json({ ok: true });
});

// ===================== SITE SETTINGS =====================
adminRouter.get("/settings", async (_req, res) => {
  const row = await prisma.siteSetting.findUnique({ where: { key: "site" } });
  res.json({ settings: row?.value ?? {} });
});

adminRouter.put("/settings", requireRole(...CAN_MANAGE), async (req, res) => {
  const value = req.body ?? {};
  const row = await prisma.siteSetting.upsert({
    where: { key: "site" },
    update: { value },
    create: { key: "site", value },
  });
  res.json({ settings: row.value });
});

// ===================== LAWYERS DIRECTORY =====================
adminRouter.get("/lawyers", async (req, res) => {
  const { district, q } = req.query as Record<string, string>;
  const lawyers = await prisma.lawyer.findMany({
    where: {
      districtId: district || undefined,
      name: q ? { contains: q, mode: "insensitive" } : undefined,
    },
    include: { district: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  res.json({ lawyers });
});

const lawyerSchema = z.object({
  name: z.string().min(1),
  spec: z.string().default(""),
  specEn: z.string().default(""),
  phone: z.string().min(1),
  chamber: z.string().optional(),
  districtId: z.string().min(1),
});

adminRouter.post("/lawyers", requireRole(...CAN_DIRECTORY), async (req, res) => {
  const parsed = lawyerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const lawyer = await prisma.lawyer.create({ data: parsed.data });
  res.status(201).json({ lawyer });
});

adminRouter.put("/lawyers/:id", requireRole(...CAN_DIRECTORY), async (req, res) => {
  const parsed = lawyerSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const lawyer = await prisma.lawyer
    .update({ where: { id: req.params.id }, data: parsed.data })
    .catch(() => null);
  if (!lawyer) return res.status(404).json({ error: "Not found" });
  res.json({ lawyer });
});

adminRouter.delete("/lawyers/:id", requireRole(...CAN_DIRECTORY), async (req, res) => {
  await prisma.lawyer.delete({ where: { id: req.params.id } }).catch(() => null);
  res.json({ ok: true });
});

// ===================== BLOOD DONORS DIRECTORY =====================
adminRouter.get("/donors", async (req, res) => {
  const { group, q } = req.query as Record<string, string>;
  const donors = await prisma.bloodDonor.findMany({
    where: {
      group: group || undefined,
      name: q ? { contains: q, mode: "insensitive" } : undefined,
    },
    include: { district: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  res.json({ donors });
});

const donorSchema = z.object({
  name: z.string().min(1),
  group: z.string().min(1),
  phone: z.string().min(1),
  districtId: z.string().min(1),
});

adminRouter.post("/donors", requireRole(...CAN_DIRECTORY), async (req, res) => {
  const parsed = donorSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const donor = await prisma.bloodDonor.create({ data: parsed.data });
  res.status(201).json({ donor });
});

adminRouter.put("/donors/:id", requireRole(...CAN_DIRECTORY), async (req, res) => {
  const parsed = donorSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const donor = await prisma.bloodDonor
    .update({ where: { id: req.params.id }, data: parsed.data })
    .catch(() => null);
  if (!donor) return res.status(404).json({ error: "Not found" });
  res.json({ donor });
});

adminRouter.delete("/donors/:id", requireRole(...CAN_DIRECTORY), async (req, res) => {
  await prisma.bloodDonor.delete({ where: { id: req.params.id } }).catch(() => null);
  res.json({ ok: true });
});

// ===================== COMMENTS (moderation) =====================
adminRouter.get("/comments", async (req, res) => {
  const { status } = req.query as Record<string, string>;
  const comments = await prisma.comment.findMany({
    where: status ? { status: status as never } : undefined,
    include: { article: { select: { title: true, slug: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  res.json({ comments });
});

adminRouter.patch("/comments/:id", requireRole(...CAN_MODERATE), async (req, res) => {
  const status = String(req.body?.status);
  if (!["PENDING", "APPROVED", "REJECTED", "SPAM"].includes(status))
    return res.status(400).json({ error: "Invalid status" });
  const comment = await prisma.comment
    .update({ where: { id: req.params.id }, data: { status: status as never } })
    .catch(() => null);
  if (!comment) return res.status(404).json({ error: "Not found" });
  res.json({ comment });
});

adminRouter.delete("/comments/:id", requireRole(...CAN_MODERATE), async (req, res) => {
  await prisma.comment.delete({ where: { id: req.params.id } }).catch(() => null);
  res.json({ ok: true });
});

// ===================== ANALYTICS (dashboard) =====================
adminRouter.get("/analytics", async (_req, res) => {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const last24 = new Date(now.getTime() - 24 * 3600 * 1000);
  const online5 = new Date(now.getTime() - 5 * 60 * 1000);

  const [
    totalViews,
    todayViews,
    hourlyRows,
    onlineRows,
    uniqueToday,
    devices,
    countries,
    referrers,
    browsers,
    recent,
    articles,
    breaking,
    pendingComments,
    ads,
  ] = await Promise.all([
    prisma.pageView.count(),
    prisma.pageView.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.pageView.findMany({
      where: { createdAt: { gte: last24 } },
      select: { createdAt: true },
    }),
    prisma.pageView.findMany({
      where: { createdAt: { gte: online5 } },
      select: { ip: true },
    }),
    prisma.pageView.findMany({
      where: { createdAt: { gte: startOfToday } },
      select: { ip: true },
      distinct: ["ip"],
    }),
    prisma.pageView.groupBy({ by: ["device"], _count: { _all: true } }),
    prisma.pageView.groupBy({
      by: ["country"],
      _count: { _all: true },
      orderBy: { _count: { country: "desc" } },
      take: 6,
    }),
    prisma.pageView.groupBy({
      by: ["referrer"],
      _count: { _all: true },
      orderBy: { _count: { referrer: "desc" } },
      take: 6,
    }),
    prisma.pageView.groupBy({
      by: ["browser"],
      _count: { _all: true },
      orderBy: { _count: { browser: "desc" } },
      take: 6,
    }),
    prisma.pageView.findMany({
      orderBy: { createdAt: "desc" },
      take: 15,
      select: {
        path: true,
        ip: true,
        country: true,
        city: true,
        device: true,
        browser: true,
        os: true,
        referrer: true,
        createdAt: true,
      },
    }),
    prisma.article.count(),
    prisma.breakingItem.count({ where: { active: true } }),
    prisma.comment.count({ where: { status: "PENDING" } }),
    prisma.ad.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  // 24 hourly buckets ending at the current hour.
  const base = new Date(now);
  base.setMinutes(0, 0, 0);
  const firstHourMs = base.getTime() - 23 * 3600 * 1000;
  const hourly = Array.from({ length: 24 }, (_, i) => {
    const d = new Date(firstHourMs + i * 3600 * 1000);
    return { hour: `${String(d.getHours()).padStart(2, "0")}`, count: 0 };
  });
  for (const row of hourlyRows) {
    const idx = Math.floor((row.createdAt.getTime() - firstHourMs) / (3600 * 1000));
    if (idx >= 0 && idx < 24) hourly[idx].count += 1;
  }

  const online = new Set(onlineRows.map((o) => o.ip).filter(Boolean)).size;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const asRows = (rows: any[], key: string) =>
    rows.map((r) => ({ label: r[key] || "—", count: r._count._all }));

  const adImpressions = ads.reduce((s, a) => s + a.impressions, 0);
  const adClicks = ads.reduce((s, a) => s + a.clicks, 0);

  res.json({
    totals: {
      totalViews,
      todayViews,
      uniqueToday: uniqueToday.length,
      online,
      articles,
      breaking,
      pendingComments,
      adImpressions,
      adClicks,
    },
    hourly,
    devices: asRows(devices, "device"),
    countries: asRows(countries, "country"),
    browsers: asRows(browsers, "browser"),
    referrers: referrers.map((r) => ({
      label: r.referrer || "Direct",
      count: r._count._all,
    })),
    recent,
    ads,
  });
});

// ===================== ADS =====================
const adSchema = z.object({
  name: z.string().min(1),
  imageUrl: z.string().min(1),
  linkUrl: z.string().min(1),
  placement: z.enum(["HEADER", "SIDEBAR", "IN_ARTICLE", "FOOTER", "POPUP"]),
  active: z.boolean().default(true),
  startsAt: z.string().nullable().optional(),
  endsAt: z.string().nullable().optional(),
});

adminRouter.get("/ads", async (_req, res) => {
  const ads = await prisma.ad.findMany({
    orderBy: { createdAt: "desc" },
    include: { account: { select: { name: true, email: true } } },
  });
  res.json({ ads });
});

// Approve / reject an advertiser-booked ad. Approving = payment confirmed →
// the ad goes live for `days` from now.
adminRouter.patch("/ads/:id/status", requireRole(...CAN_MANAGE), async (req, res) => {
  const status = String(req.body?.status);
  if (!["PENDING", "ACTIVE", "REJECTED", "EXPIRED"].includes(status))
    return res.status(400).json({ error: "Invalid status" });

  const ad = await prisma.ad.findUnique({ where: { id: req.params.id } });
  if (!ad) return res.status(404).json({ error: "Not found" });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = { status };
  if (status === "ACTIVE") {
    data.active = true;
    data.paid = true;
    // Keep the advertiser's chosen schedule; only fill gaps for house ads.
    const start = ad.startsAt ?? new Date();
    data.startsAt = start;
    data.endsAt =
      ad.endsAt ?? new Date(start.getTime() + (ad.days || 1) * 24 * 3600 * 1000);
  } else {
    data.active = false;
  }
  const updated = await prisma.ad.update({ where: { id: ad.id }, data });
  emitAnalytics({ type: "ad" });
  res.json({ ad: updated });
});

adminRouter.post("/ads", requireRole(...CAN_MANAGE), async (req, res) => {
  const parsed = adSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "সঠিক তথ্য দিন" });
  const d = parsed.data;
  const ad = await prisma.ad.create({
    data: {
      name: d.name,
      imageUrl: d.imageUrl,
      linkUrl: d.linkUrl,
      placement: d.placement,
      active: d.active,
      startsAt: d.startsAt ? new Date(d.startsAt) : null,
      endsAt: d.endsAt ? new Date(d.endsAt) : null,
    },
  });
  res.status(201).json({ ad });
});

adminRouter.put("/ads/:id", requireRole(...CAN_MANAGE), async (req, res) => {
  const parsed = adSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "সঠিক তথ্য দিন" });
  const d = parsed.data;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {};
  if (d.name !== undefined) data.name = d.name;
  if (d.imageUrl !== undefined) data.imageUrl = d.imageUrl;
  if (d.linkUrl !== undefined) data.linkUrl = d.linkUrl;
  if (d.placement !== undefined) data.placement = d.placement;
  if (d.active !== undefined) data.active = d.active;
  if (d.startsAt !== undefined) data.startsAt = d.startsAt ? new Date(d.startsAt) : null;
  if (d.endsAt !== undefined) data.endsAt = d.endsAt ? new Date(d.endsAt) : null;
  const ad = await prisma.ad
    .update({ where: { id: req.params.id }, data })
    .catch(() => null);
  if (!ad) return res.status(404).json({ error: "Not found" });
  res.json({ ad });
});

adminRouter.delete("/ads/:id", requireRole(...CAN_MANAGE), async (req, res) => {
  await prisma.ad.delete({ where: { id: req.params.id } }).catch(() => null);
  res.json({ ok: true });
});

// ===================== E-PAPER EDITIONS =====================
const epaperSchema = z.object({
  date: z.string().min(1),
  pdfUrl: z.string().min(1),
  thumbnail: z.string().nullable().optional(),
  published: z.boolean().default(true),
});

adminRouter.get("/epaper", async (_req, res) => {
  const editions = await prisma.epaperEdition.findMany({
    orderBy: { date: "desc" },
  });
  res.json({ editions });
});

adminRouter.post("/epaper", requireRole(...CAN_PUBLISH), async (req, res) => {
  const parsed = epaperSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "সঠিক তথ্য দিন" });
  const edition = await prisma.epaperEdition.create({
    data: {
      date: new Date(parsed.data.date),
      pdfUrl: parsed.data.pdfUrl,
      thumbnail: parsed.data.thumbnail || null,
      published: parsed.data.published,
    },
  });
  res.status(201).json({ edition });
});

adminRouter.patch("/epaper/:id", requireRole(...CAN_PUBLISH), async (req, res) => {
  const body = req.body ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = {};
  if (typeof body.published === "boolean") data.published = body.published;
  if (body.date) data.date = new Date(body.date);
  if (body.pdfUrl) data.pdfUrl = body.pdfUrl;
  if (body.thumbnail !== undefined) data.thumbnail = body.thumbnail || null;
  const edition = await prisma.epaperEdition
    .update({ where: { id: req.params.id }, data })
    .catch(() => null);
  if (!edition) return res.status(404).json({ error: "Not found" });
  res.json({ edition });
});

adminRouter.delete("/epaper/:id", requireRole(...CAN_PUBLISH), async (req, res) => {
  const item = await prisma.epaperEdition
    .delete({ where: { id: req.params.id } })
    .catch(() => null);
  if (item) {
    const file = item.pdfUrl.split("/uploads/")[1];
    if (file) fs.promises.rm(path.join(UPLOAD_DIR, file)).catch(() => {});
  }
  res.json({ ok: true });
});
