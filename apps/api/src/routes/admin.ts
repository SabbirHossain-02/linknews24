import { Router } from "express";
import { z } from "zod";
import path from "node:path";
import fs from "node:fs";
import multer from "multer";
import { prisma } from "../prisma";
import { requireRole } from "../middleware/auth";
import { CAN_MANAGE, CAN_PUBLISH, CAN_WRITE, slugify } from "../lib/roles";

export const adminRouter = Router();

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
  status: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED"]).default("DRAFT"),
  seoTitle: z.string().nullable().optional(),
  seoDescription: z.string().nullable().optional(),
});

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

// --- Article list (all statuses) ---
adminRouter.get("/articles", async (req, res) => {
  const { status, category, q } = req.query as Record<string, string>;
  const articles = await prisma.article.findMany({
    where: {
      status: status ? (status as never) : undefined,
      categoryId: category || undefined,
      OR: q
        ? [
            { title: { contains: q, mode: "insensitive" } },
            { titleEn: { contains: q, mode: "insensitive" } },
          ]
        : undefined,
    },
    include: {
      category: { select: { name: true, nameEn: true, slug: true } },
      author: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
  res.json({ articles });
});

// --- Single article ---
adminRouter.get("/articles/:id", async (req, res) => {
  const article = await prisma.article.findUnique({
    where: { id: req.params.id },
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
      status,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
      authorId: req.user!.id,
      authorName: data.authorName?.trim() || null,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
    },
  });
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
    },
  });
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
