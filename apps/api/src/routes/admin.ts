import { Router } from "express";
import { z } from "zod";
import path from "node:path";
import fs from "node:fs";
import multer from "multer";
import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { isSuper, requireRole } from "../middleware/auth";
import { slugify } from "../lib/roles";
import { hashPassword, verifyPassword } from "../lib/password";
import {
  emitChange,
  emitAnalytics,
  emitToSupers,
  onlineCount,
  refreshUserRooms,
  revokeUser,
} from "../realtime";
import {
  articleSchema,
  categoryExists,
  clearOtherHeroes,
  contentFields,
  resolveStatus,
  tagConnectOrCreate,
  uniqueSlug,
} from "../lib/articles";
import { logWork, notifyStaff } from "../lib/staffNotify";
import { breakingEnabled } from "../lib/siteSettings";
import { adReport } from "../lib/adTracking";
import { auditArticles, readSeo, sitemapStats, writeSeo } from "../lib/seo";
import { newsroomRouter } from "./newsroom";
import { recentLogins } from "../lib/audit";

export const adminRouter = Router();

// Broadcast a realtime "content changed" event after any successful mutation.
// Changes to the other modules are also written to the team activity feed;
// articles, users and approvals log their own, more specific entries.
const SELF_LOGGING = ["articles", "approvals", "users", "permissions", "my", "me", "media"];
adminRouter.use((req, res, next) => {
  if (req.method !== "GET") {
    res.on("finish", () => {
      if (res.statusCode >= 400) return;
      emitChange({ path: req.path });
      const section = req.path.split("/")[1] ?? "";
      if (req.user && section && !SELF_LOGGING.includes(section))
        logWork({
          userId: req.user.id,
          action: req.method === "DELETE" ? "module_delete" : "module_edit",
          entity: section,
          detail: req.path,
        });
    });
  }
  next();
});

// Staff, permissions, approvals, the team page and each person's own figures.
adminRouter.use(newsroomRouter);

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

// --- Article list (all statuses, filtered + paginated) ---
adminRouter.get("/articles", async (req, res) => {
  const {
    status,
    category,
    q,
    mine,
    page = "1",
    limit = "20",
  } = req.query as Record<string, string>;

  const take = Math.min(Number(limit) || 20, 50);
  const currentPage = Math.max(Number(page) || 1, 1);
  const skip = (currentPage - 1) * take;

  const STATUSES = ["DRAFT", "SCHEDULED", "PENDING", "REJECTED", "PUBLISHED"];
  const where = {
    status: STATUSES.includes(status) ? (status as never) : undefined,
    categoryId: category || undefined,
    authorId: mine === "1" ? req.user!.id : undefined,
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
      omit: { body: true, bodyEn: true },
      include: {
        category: { select: { name: true, nameEn: true, slug: true } },
        author: { select: { name: true } },
        // A live story with an edit waiting for approval is marked in the list.
        _count: { select: { revisions: { where: { status: "PENDING" } } } },
      },
      // Newest published first, drafts after them, and stable while you work:
      // ordering by updatedAt meant flipping a switch moved that row to the
      // top of the list, so every click reshuffled the page under the pointer.
      orderBy: [
        { publishedAt: { sort: "desc", nulls: "last" } },
        { createdAt: "desc" },
      ],
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
  // An edit to this live story still waiting for the Super Admin, if any.
  const pendingRevision = await prisma.articleRevision.findFirst({
    where: { articleId: article.id, status: "PENDING" },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      data: true,
      createdAt: true,
      updatedAt: true,
      author: { select: { id: true, name: true } },
    },
  });
  res.json({ article, pendingRevision });
});

const NEEDS_APPROVAL_LIVE =
  "প্রকাশিত খবরে পরিবর্তনের জন্য সুপার অ্যাডমিনের অনুমোদন লাগবে";
const OWN_ONLY = "শুধু নিজের খবর সম্পাদনা করতে পারবেন";

// --- Create ---
adminRouter.post("/articles", async (req, res) => {
  const parsed = articleSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: "Invalid input", issues: parsed.error.issues });
  const data = parsed.data;
  if (!(await categoryExists(data.categoryId)))
    return res.status(400).json({ error: "ক্যাটাগরি পাওয়া যায়নি" });

  const sup = isSuper(req.user);
  const status = resolveStatus(data.status, sup);
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
      isBreaking: data.isBreaking,
      featured: data.featured,
      isHero: data.isHero,
      status,
      seoTitle: data.seoTitle ?? null,
      seoDescription: data.seoDescription ?? null,
      authorId: req.user!.id,
      authorName: data.authorName?.trim() || null,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      submittedAt: status === "PENDING" ? new Date() : null,
      tags: { connectOrCreate: tagConnectOrCreate(data.tags) },
    },
  });
  if (article.isHero && article.status === "PUBLISHED")
    await clearOtherHeroes(article.id);

  await logWork({
    userId: req.user!.id,
    action: status === "PENDING" ? "article_submitted" : "article_created",
    entity: "article",
    entityId: article.id,
    detail: article.title,
  });
  if (status === "PENDING") emitToSupers("approvals:changed");
  res.status(201).json({ article, pendingReview: status === "PENDING" });
});

// --- Update ---
adminRouter.put("/articles/:id", async (req, res) => {
  const existing = await prisma.article.findUnique({ where: { id: req.params.id } });
  if (!existing) return res.status(404).json({ error: "Not found" });

  const me = req.user!;
  const sup = isSuper(me);
  // Reporters may only edit their own stories.
  if (me.role === "REPORTER" && existing.authorId !== me.id)
    return res.status(403).json({ error: OWN_ONLY });

  const parsed = articleSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: "Invalid input", issues: parsed.error.issues });
  const data = parsed.data;
  if (!(await categoryExists(data.categoryId)))
    return res.status(400).json({ error: "ক্যাটাগরি পাওয়া যায়নি" });

  // A live story is not changed by anyone but the Super Admin: the edit is
  // kept aside as a revision, and readers go on seeing the approved version
  // until it is accepted.
  if (!sup && existing.status === "PUBLISHED") {
    const open = await prisma.articleRevision.findFirst({
      where: { articleId: existing.id, status: "PENDING" },
      select: { id: true },
    });
    const revisionData = data as unknown as Prisma.InputJsonValue;
    const revision = open
      ? await prisma.articleRevision.update({
          where: { id: open.id },
          data: { data: revisionData, authorId: me.id },
        })
      : await prisma.articleRevision.create({
          data: { articleId: existing.id, authorId: me.id, data: revisionData },
        });
    await logWork({
      userId: me.id,
      action: "revision_submitted",
      entity: "article",
      entityId: existing.id,
      detail: data.title,
    });
    emitToSupers("approvals:changed");
    return res.json({ article: existing, revision, pendingReview: true });
  }

  const status = resolveStatus(data.status, sup);
  const approving = sup && existing.status === "PENDING" && status === "PUBLISHED";

  const article = await prisma.article.update({
    where: { id: existing.id },
    data: {
      ...(await contentFields(data, existing)),
      status,
      publishedAt:
        status === "PUBLISHED"
          ? existing.publishedAt ?? new Date()
          : status === "DRAFT" || status === "PENDING"
            ? null
            : existing.publishedAt,
      submittedAt: status === "PENDING" ? new Date() : existing.submittedAt,
      // Resubmitting clears the old reason; approving records who decided.
      reviewNote: status === "PENDING" || approving ? null : existing.reviewNote,
      ...(approving ? { reviewedById: me.id, reviewedAt: new Date() } : {}),
      // Only a change to something already published is an update a reader
      // needs to know about; going live for the first time is publication, and
      // publishedAt already says when that was.
      editedAt: existing.publishedAt ? new Date() : existing.editedAt,
    },
  });
  if (article.isHero && article.status === "PUBLISHED")
    await clearOtherHeroes(article.id);

  await logWork({
    userId: me.id,
    action:
      status === "PENDING" && existing.status !== "PENDING"
        ? "article_submitted"
        : approving
          ? "article_approved"
          : "article_updated",
    entity: "article",
    entityId: article.id,
    detail: article.title,
  });
  if (approving && existing.authorId !== me.id)
    await notifyStaff(existing.authorId, {
      kind: "article_approved",
      title: article.title,
      href: `/admin/articles/${article.id}/edit`,
    });
  if (status === "PENDING" || existing.status === "PENDING")
    emitToSupers("approvals:changed");
  res.json({ article, pendingReview: status === "PENDING" });
});

// --- Quick flag toggles (publish / breaking / featured) ---
const flagsSchema = z.object({
  status: z.enum(["DRAFT", "SCHEDULED", "PENDING", "PUBLISHED"]).optional(),
  isBreaking: z.boolean().optional(),
  featured: z.boolean().optional(),
});

adminRouter.patch("/articles/:id/flags", async (req, res) => {
  const existing = await prisma.article.findUnique({
    where: { id: req.params.id },
  });
  if (!existing) return res.status(404).json({ error: "Not found" });

  const parsed = flagsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const { isBreaking, featured } = parsed.data;

  const me = req.user!;
  const sup = isSuper(me);
  if (!sup && existing.status === "PUBLISHED")
    return res.status(403).json({ error: NEEDS_APPROVAL_LIVE });
  if (me.role === "REPORTER" && existing.authorId !== me.id)
    return res.status(403).json({ error: OWN_ONLY });

  const status = parsed.data.status
    ? resolveStatus(parsed.data.status, sup)
    : existing.status;
  const approving = sup && existing.status === "PENDING" && status === "PUBLISHED";

  const article = await prisma.article.update({
    where: { id: existing.id },
    data: {
      isBreaking: isBreaking ?? existing.isBreaking,
      featured: featured ?? existing.featured,
      status,
      publishedAt:
        status === "PUBLISHED"
          ? existing.publishedAt ?? new Date()
          : status === "DRAFT" || status === "PENDING"
            ? null
            : existing.publishedAt,
      submittedAt:
        status === "PENDING" && existing.status !== "PENDING"
          ? new Date()
          : existing.submittedAt,
      ...(approving
        ? { reviewedById: me.id, reviewedAt: new Date(), reviewNote: null }
        : {}),
    },
  });

  if (status !== existing.status) {
    await logWork({
      userId: me.id,
      action:
        status === "PENDING"
          ? "article_submitted"
          : approving
            ? "article_approved"
            : status === "PUBLISHED"
              ? "article_published"
              : "article_unpublished",
      entity: "article",
      entityId: article.id,
      detail: article.title,
    });
    if (approving && existing.authorId !== me.id)
      await notifyStaff(existing.authorId, {
        kind: "article_approved",
        title: article.title,
        href: `/admin/articles/${article.id}/edit`,
      });
    if (status === "PENDING" || existing.status === "PENDING")
      emitToSupers("approvals:changed");
  }
  res.json({ article, pendingReview: status === "PENDING" });
});

// --- Delete ---
adminRouter.delete("/articles/:id", async (req, res) => {
  const me = req.user!;
  const existing = await prisma.article.findUnique({
    where: { id: req.params.id },
    select: { id: true, title: true, authorId: true, status: true },
  });
  if (!existing) return res.json({ ok: true });
  if (me.role === "REPORTER" && existing.authorId !== me.id)
    return res.status(403).json({ error: OWN_ONLY });
  await prisma.article.delete({ where: { id: existing.id } }).catch(() => null);
  await logWork({
    userId: me.id,
    action: "article_deleted",
    entity: "article",
    entityId: existing.id,
    detail: existing.title,
  });
  if (existing.status === "PENDING") emitToSupers("approvals:changed");
  res.json({ ok: true });
});

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

adminRouter.put("/livetv", async (req, res) => {
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
/**
 * Everything the ticker carries, as the Breaking News page needs it: the
 * typed lines, the published stories whose "breaking" switch is on (the
 * ticker shows both, so the page must too), and whether the bar is on at all.
 */
adminRouter.get("/breaking", async (_req, res) => {
  const [items, articles, enabled] = await Promise.all([
    prisma.breakingItem.findMany({ orderBy: { order: "asc" } }),
    prisma.article.findMany({
      where: { isBreaking: true, status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      select: { id: true, title: true, titleEn: true, slug: true, publishedAt: true },
    }),
    breakingEnabled(),
  ]);
  res.json({ items, articles, enabled });
});

/** The whole breaking bar on or off for readers, with one switch. */
adminRouter.put("/breaking/settings", async (req, res) => {
  const parsed = z.object({ enabled: z.boolean() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  await prisma.siteSetting.upsert({
    where: { key: "breaking" },
    update: { value: { enabled: parsed.data.enabled } },
    create: { key: "breaking", value: { enabled: parsed.data.enabled } },
  });
  res.json({ enabled: parsed.data.enabled });
});

/**
 * Take a story off the ticker (or put it back) from the Breaking News page.
 * This is ticker curation, governed by the breaking-news permission — the
 * story's own content is not touched.
 */
adminRouter.put("/breaking/articles/:id", async (req, res) => {
  const parsed = z.object({ isBreaking: z.boolean() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const article = await prisma.article
    .update({
      where: { id: req.params.id },
      data: { isBreaking: parsed.data.isBreaking },
      select: { id: true, title: true, isBreaking: true },
    })
    .catch(() => null);
  if (!article) return res.status(404).json({ error: "Not found" });
  res.json({ article });
});

const breakingSchema = z.object({
  text: z.string().min(1),
  textEn: z.string().default(""),
  active: z.boolean().default(true),
  order: z.number().int().default(0),
});

adminRouter.post("/breaking", async (req, res) => {
  const parsed = breakingSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const count = await prisma.breakingItem.count();
  const item = await prisma.breakingItem.create({
    data: { ...parsed.data, order: parsed.data.order || count },
  });
  res.status(201).json({ item });
});

adminRouter.put("/breaking/:id", async (req, res) => {
  const parsed = breakingSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const item = await prisma.breakingItem
    .update({ where: { id: req.params.id }, data: parsed.data })
    .catch(() => null);
  if (!item) return res.status(404).json({ error: "Not found" });
  res.json({ item });
});

adminRouter.delete("/breaking/:id", async (req, res) => {
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
  /** Nest under another category — this is what turns it into a nav dropdown. */
  parentId: z.string().nullable().optional(),
});

/**
 * Checks that `parentId` is a legal parent for `id`.
 *
 * Nesting is kept to a single level because that is what the site nav renders:
 * a parent becomes a dropdown and its children become the entries. Allowing
 * deeper trees would silently hide the third level from readers.
 */
async function validateParent(
  id: string | null,
  parentId: string | null | undefined,
): Promise<string | null> {
  if (!parentId) return null;
  if (parentId === id) return "একটি ক্যাটাগরি নিজেই নিজের ভেতরে বসতে পারে না";

  const parent = await prisma.category.findUnique({ where: { id: parentId } });
  if (!parent) return "মূল ক্যাটাগরিটি পাওয়া যায়নি";
  if (parent.parentId)
    return "যেটির নিচে বসাচ্ছেন সেটি নিজেই আরেকটির ভেতরে আছে — এক ধাপের বেশি গভীরে যাওয়া যাবে না";

  if (id) {
    const childCount = await prisma.category.count({ where: { parentId: id } });
    if (childCount > 0)
      return "এই ক্যাটাগরির নিচে অন্য ক্যাটাগরি আছে — আগে সেগুলো সরান";
  }
  return null;
}

adminRouter.post("/categories", async (req, res) => {
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
  const parentError = await validateParent(null, d.parentId);
  if (parentError) return res.status(400).json({ error: parentError });

  const count = await prisma.category.count();
  const category = await prisma.category.create({
    data: {
      name: d.name,
      nameEn: d.nameEn,
      slug,
      visible: d.visible,
      order: d.order ?? count,
      parentId: d.parentId ?? null,
    },
  });
  res.status(201).json({ category });
});

adminRouter.put("/categories/:id", async (req, res) => {
  const parsed = categorySchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  if (parsed.data.parentId !== undefined) {
    const parentError = await validateParent(req.params.id, parsed.data.parentId);
    if (parentError) return res.status(400).json({ error: parentError });
  }

  const category = await prisma.category
    .update({
      where: { id: req.params.id },
      data: {
        name: parsed.data.name,
        nameEn: parsed.data.nameEn,
        visible: parsed.data.visible,
        order: parsed.data.order,
        // `undefined` leaves it alone; `null` moves it back to the top level.
        parentId: parsed.data.parentId,
      },
    })
    .catch(() => null);
  if (!category) return res.status(404).json({ error: "Not found" });
  res.json({ category });
});

/**
 * Delete a category.
 *
 * Articles point at their category, so the database will not let one go while
 * it still holds any — otherwise those stories would be orphaned. The caller
 * chooses what happens to them:
 *
 *   ?moveTo=<categoryId>   reassign the articles, then delete the category
 *   ?withArticles=true     delete the articles too (comments cascade with them)
 *
 * With neither, a category that holds articles comes back as 409 with the
 * count, so the UI can ask rather than fail silently.
 */
adminRouter.delete("/categories/:id", async (req, res) => {
  const id = req.params.id;
  const moveTo = (req.query.moveTo as string | undefined)?.trim();
  const withArticles = req.query.withArticles === "true";

  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { articles: true } } },
  });
  if (!category) return res.status(404).json({ error: "ক্যাটাগরি পাওয়া যায়নি" });

  const articleCount = category._count.articles;

  if (articleCount > 0 && !moveTo && !withArticles) {
    return res.status(409).json({
      error: `এই ক্যাটাগরিতে ${articleCount}টি আর্টিকেল আছে`,
      articleCount,
      needsChoice: true,
    });
  }

  if (moveTo) {
    if (moveTo === id)
      return res.status(400).json({ error: "একই ক্যাটাগরিতে সরানো যাবে না" });
    const target = await prisma.category.findUnique({ where: { id: moveTo } });
    if (!target)
      return res.status(400).json({ error: "যেখানে সরাবেন সেই ক্যাটাগরি নেই" });

    await prisma.article.updateMany({
      where: { categoryId: id },
      data: { categoryId: moveTo },
    });
  }

  // Homepage sections point at categories as well. Repoint them when the
  // articles move; otherwise hide the section, or the homepage keeps a row
  // that can never fill.
  await prisma.homepageSection.updateMany({
    where: { categoryId: id },
    data: moveTo ? { categoryId: moveTo } : { categoryId: null, visible: false },
  });

  // Comments cascade from Article, and the article↔tag join rows go with it.
  if (withArticles && !moveTo) {
    await prisma.article.deleteMany({ where: { categoryId: id } });
  }

  try {
    await prisma.category.delete({ where: { id } });
  } catch {
    return res
      .status(400)
      .json({ error: "ক্যাটাগরিটি মুছতে পারা গেল না — এখনো কিছু যুক্ত আছে" });
  }

  res.json({
    ok: true,
    moved: moveTo ? articleCount : 0,
    deletedArticles: withArticles && !moveTo ? articleCount : 0,
  });
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

adminRouter.post("/homepage", async (req, res) => {
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

adminRouter.put("/homepage/:id", async (req, res) => {
  const parsed = sectionSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const section = await prisma.homepageSection
    .update({ where: { id: req.params.id }, data: parsed.data })
    .catch(() => null);
  if (!section) return res.status(404).json({ error: "Not found" });
  res.json({ section });
});

adminRouter.delete("/homepage/:id", async (req, res) => {
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

// ===================== MEDIA LIBRARY =====================
adminRouter.get("/media", async (_req, res) => {
  const media = await prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  res.json({ media });
});

adminRouter.delete("/media/:id", async (req, res) => {
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

adminRouter.delete("/subscribers/:id", async (req, res) => {
  await prisma.subscriber.delete({ where: { id: req.params.id } }).catch(() => null);
  res.json({ ok: true });
});

// ===================== SITE SETTINGS =====================
// ===================== NOTIFICATIONS & PROFILE =====================

/**
 * Recent sign-in activity. Super Admin only: it carries other people's
 * addresses and the addresses attackers have tried.
 */
adminRouter.get("/security/logins", requireRole("SUPER_ADMIN"), async (req, res) => {
  res.json({ logins: await recentLogins(Number(req.query.take) || 50) });
});

const profileSchema = z.object({
  name: z.string().trim().min(1).max(80),
  avatar: z.string().trim().max(500).nullable().optional(),
  email: z.string().trim().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});

/**
 * The signed-in person's own account — name, picture, email and password.
 * This is not the Users page, which is about other people's accounts, so it
 * needs no role: everyone may change their own.
 *
 * Changing the email or the password requires the current password. Without
 * that, anyone who found an unattended logged-in browser could take the
 * account over by pointing it at their own address.
 */
adminRouter.put("/me", async (req, res) => {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: "তথ্য ঠিকভাবে পূরণ করুন" });
  const { name, avatar, email, currentPassword, newPassword } = parsed.data;

  const me = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!me) return res.status(401).json({ error: "Unauthorized" });

  const wantsEmail = !!email && email.toLowerCase() !== me.email.toLowerCase();
  const wantsPassword = !!newPassword;

  if (wantsEmail || wantsPassword) {
    if (!currentPassword)
      return res.status(400).json({ error: "বর্তমান পাসওয়ার্ড দিন" });
    if (!(await verifyPassword(currentPassword, me.password)))
      return res.status(400).json({ error: "বর্তমান পাসওয়ার্ড ঠিক নয়" });
  }

  if (wantsEmail) {
    const taken = await prisma.user.findUnique({ where: { email: email! } });
    if (taken && taken.id !== me.id)
      return res.status(409).json({ error: "এই ইমেইল আগে থেকেই ব্যবহৃত" });
  }

  const user = await prisma.user.update({
    where: { id: me.id },
    data: {
      name,
      avatar: avatar?.trim() || null,
      ...(wantsEmail ? { email: email! } : {}),
      ...(wantsPassword ? { password: await hashPassword(newPassword!) } : {}),
    },
    select: { id: true, name: true, email: true, role: true, avatar: true, bio: true },
  });
  res.json({ user });
});

// ===================== SEO =====================

/**
 * Everything the SEO page shows: the saved settings, what the sitemap will
 * contain, and an audit of the published articles. All three are read from the
 * same data the public site serves — none of it is illustrative.
 */
adminRouter.get("/seo", async (_req, res) => {
  const [settings, sitemap, audit] = await Promise.all([
    readSeo(),
    sitemapStats(),
    auditArticles(),
  ]);
  res.json({ settings, sitemap, audit });
});

adminRouter.put("/seo", async (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const str = (k: string) =>
    typeof body[k] === "string" ? (body[k] as string).trim() : undefined;

  const settings = await writeSeo({
    siteName: str("siteName"),
    titleTemplate: str("titleTemplate"),
    defaultTitle: str("defaultTitle"),
    defaultTitleEn: str("defaultTitleEn"),
    defaultDescription: str("defaultDescription"),
    defaultDescriptionEn: str("defaultDescriptionEn"),
    keywords: str("keywords"),
    defaultOgImage: str("defaultOgImage"),
    twitterHandle: str("twitterHandle"),
    indexable: typeof body.indexable === "boolean" ? body.indexable : undefined,
    robotsDisallow: str("robotsDisallow"),
    googleVerification: str("googleVerification"),
    bingVerification: str("bingVerification"),
    organizationName: str("organizationName"),
    organizationLogo: str("organizationLogo"),
  });
  res.json({ settings });
});

adminRouter.get("/settings", async (_req, res) => {
  const row = await prisma.siteSetting.findUnique({ where: { key: "site" } });
  res.json({ settings: row?.value ?? {} });
});

adminRouter.put("/settings", async (req, res) => {
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

adminRouter.post("/lawyers", async (req, res) => {
  const parsed = lawyerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const lawyer = await prisma.lawyer.create({ data: parsed.data });
  res.status(201).json({ lawyer });
});

adminRouter.put("/lawyers/:id", async (req, res) => {
  const parsed = lawyerSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const lawyer = await prisma.lawyer
    .update({ where: { id: req.params.id }, data: parsed.data })
    .catch(() => null);
  if (!lawyer) return res.status(404).json({ error: "Not found" });
  res.json({ lawyer });
});

adminRouter.delete("/lawyers/:id", async (req, res) => {
  await prisma.lawyer.delete({ where: { id: req.params.id } }).catch(() => null);
  res.json({ ok: true });
});

// ===================== BLOOD DONORS DIRECTORY =====================
adminRouter.get("/donors", async (req, res) => {
  const { group, q, status } = req.query as Record<string, string>;
  const donors = await prisma.bloodDonor.findMany({
    where: {
      group: group || undefined,
      name: q ? { contains: q, mode: "insensitive" } : undefined,
      status: status ? (status as never) : undefined,
    },
    include: {
      district: { select: { name: true } },
      account: { select: { name: true, email: true, avatar: true } },
      // Donation entries are what the badge is built from, so a reviewer can
      // check the dates rather than trust a number.
      donations: { orderBy: { donatedOn: "desc" } },
      _count: { select: { likes: true } },
    },
    // Pending first — the queue is the reason to open this page.
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
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

adminRouter.post("/donors", async (req, res) => {
  const parsed = donorSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const donor = await prisma.bloodDonor.create({ data: parsed.data });
  res.status(201).json({ donor });
});

adminRouter.put("/donors/:id", async (req, res) => {
  const parsed = donorSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const donor = await prisma.bloodDonor
    .update({ where: { id: req.params.id }, data: parsed.data })
    .catch(() => null);
  if (!donor) return res.status(404).json({ error: "Not found" });
  res.json({ donor });
});

adminRouter.delete("/donors/:id", async (req, res) => {
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

adminRouter.patch("/comments/:id", async (req, res) => {
  const status = String(req.body?.status);
  if (!["PENDING", "APPROVED", "REJECTED", "SPAM"].includes(status))
    return res.status(400).json({ error: "Invalid status" });
  const comment = await prisma.comment
    .update({ where: { id: req.params.id }, data: { status: status as never } })
    .catch(() => null);
  if (!comment) return res.status(404).json({ error: "Not found" });
  res.json({ comment });
});

adminRouter.delete("/comments/:id", async (req, res) => {
  await prisma.comment.delete({ where: { id: req.params.id } }).catch(() => null);
  res.json({ ok: true });
});

// ===================== SERVICE LISTINGS (review queue) =====================

/**
 * How many reader submissions are waiting — drives the badge in the admin nav.
 * Kept as one call so the sidebar does not fan out three requests per page.
 */
adminRouter.get("/pending-counts", async (req, res) => {
  const sup = isSuper(req.user);
  const [lawyers, donors, hospitals, comments, articles, revisions] = await Promise.all([
    prisma.lawyer.count({ where: { status: "PENDING" } }),
    prisma.bloodDonor.count({ where: { status: "PENDING" } }),
    prisma.hospital.count({ where: { status: "PENDING" } }),
    prisma.comment.count({ where: { status: "PENDING" } }),
    // The approval queue is the Super Admin's alone.
    sup ? prisma.article.count({ where: { status: "PENDING" } }) : 0,
    sup ? prisma.articleRevision.count({ where: { status: "PENDING" } }) : 0,
  ]);
  res.json({
    lawyers,
    donors,
    hospitals,
    comments,
    approvals: articles + revisions,
    total: lawyers + donors + hospitals,
  });
});

const reviewSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
  reviewNote: z.string().max(500).nullable().optional(),
});

/** Approve or reject one listing. `service` picks which table to touch. */
adminRouter.put(
  "/listings/:service/:id/review",
  async (req, res) => {
    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const { service, id } = req.params;
    const data = {
      status: parsed.data.status,
      reviewNote: parsed.data.reviewNote ?? null,
    };

    try {
      if (service === "lawyer")
        await prisma.lawyer.update({ where: { id }, data });
      else if (service === "donor")
        await prisma.bloodDonor.update({ where: { id }, data });
      else if (service === "hospital")
        await prisma.hospital.update({ where: { id }, data });
      else return res.status(400).json({ error: "অজানা সেবা" });
    } catch {
      return res.status(404).json({ error: "Not found" });
    }

    res.json({ ok: true });
  },
);

// ===================== HOSPITALS =====================
adminRouter.get("/hospitals", async (req, res) => {
  const { status, q } = req.query as Record<string, string>;
  const hospitals = await prisma.hospital.findMany({
    where: {
      ...(status ? { status: status as never } : {}),
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
    },
    include: {
      district: { select: { name: true, nameEn: true, slug: true } },
      account: { select: { name: true, email: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
  res.json({ hospitals });
});

const hospitalAdminSchema = z.object({
  name: z.string().min(2).max(160),
  type: z.enum(["GOVERNMENT", "PRIVATE", "SPECIALIZED", "NGO"]),
  address: z.string().min(3).max(300),
  districtId: z.string().min(1),
  thana: z.string().max(120).nullable().optional(),
  hotline: z.string().min(4).max(60),
  emergency24: z.boolean().default(false),
});

adminRouter.post("/hospitals", async (req, res) => {
  const parsed = hospitalAdminSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  // Staff-entered rows skip the queue — the person adding it is the reviewer.
  const hospital = await prisma.hospital.create({
    data: { ...parsed.data, status: "APPROVED" },
  });
  res.status(201).json({ hospital });
});

adminRouter.put("/hospitals/:id", async (req, res) => {
  const parsed = hospitalAdminSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const hospital = await prisma.hospital
    .update({ where: { id: req.params.id }, data: parsed.data })
    .catch(() => null);
  if (!hospital) return res.status(404).json({ error: "Not found" });
  res.json({ hospital });
});

adminRouter.delete(
  "/hospitals/:id",
  async (req, res) => {
    await prisma.hospital.delete({ where: { id: req.params.id } }).catch(() => null);
    res.json({ ok: true });
  },
);

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
    publishedArticles,
    breakingItems,
    breakingArticles,
    pendingComments,
    pendingLawyers,
    pendingDonors,
    pendingHospitals,
    subscribers,
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
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.breakingItem.count({ where: { active: true } }),
    // An article with its breaking switch on is breaking news too — the card
    // read zero while the ticker was carrying three of them.
    prisma.article.count({ where: { status: "PUBLISHED", isBreaking: true } }),
    prisma.comment.count({ where: { status: "PENDING" } }),
    prisma.lawyer.count({ where: { status: "PENDING" } }),
    prisma.bloodDonor.count({ where: { status: "PENDING" } }),
    prisma.hospital.count({ where: { status: "PENDING" } }),
    prisma.subscriber.count(),
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

  // Live socket connections, not "someone loaded a page in the last 5 minutes".
  // onlineRows is kept as a floor for the moment right after an API restart,
  // when every browser is still reconnecting.
  const online = Math.max(
    onlineCount(),
    new Set(onlineRows.map((o) => o.ip).filter(Boolean)).size,
  );
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
      publishedArticles,
      breaking: breakingItems + breakingArticles,
      pendingComments,
      pendingLawyers,
      pendingDonors,
      pendingHospitals,
      pendingListings: pendingLawyers + pendingDonors + pendingHospitals,
      subscribers,
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

/**
 * Day-by-day impressions and clicks — what an advertiser is actually shown.
 * The running totals on each ad cannot answer "how did last week go?".
 */
adminRouter.get("/ads/report", async (req, res) => {
  const days = Math.min(Math.max(Number(req.query.days) || 14, 1), 90);
  res.json(await adReport(days));
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
adminRouter.patch("/ads/:id/status", async (req, res) => {
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

adminRouter.post("/ads", async (req, res) => {
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

adminRouter.put("/ads/:id", async (req, res) => {
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

adminRouter.delete("/ads/:id", async (req, res) => {
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

adminRouter.post("/epaper", async (req, res) => {
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

adminRouter.patch("/epaper/:id", async (req, res) => {
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

adminRouter.delete("/epaper/:id", async (req, res) => {
  const item = await prisma.epaperEdition
    .delete({ where: { id: req.params.id } })
    .catch(() => null);
  if (item) {
    const file = item.pdfUrl.split("/uploads/")[1];
    if (file) fs.promises.rm(path.join(UPLOAD_DIR, file)).catch(() => {});
  }
  res.json({ ok: true });
});
