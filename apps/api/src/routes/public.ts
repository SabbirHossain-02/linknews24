import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { BLOOD_GROUPS } from "../lib/blood";
import { emitChange } from "../realtime";

export const publicRouter = Router();

// --- Directories ---
publicRouter.get("/districts", async (_req, res) => {
  const districts = await prisma.district.findMany({ orderBy: { name: "asc" } });
  res.json({ districts });
});

publicRouter.get("/lawyers/:district", async (req, res) => {
  const district = await prisma.district.findUnique({
    where: { slug: req.params.district },
  });
  if (!district) return res.status(404).json({ error: "Not found" });
  const lawyers = await prisma.lawyer.findMany({
    where: { districtId: district.id },
    orderBy: { createdAt: "asc" },
  });
  res.json({ district, lawyers });
});

publicRouter.get("/blood-groups", (_req, res) =>
  res.json({ groups: BLOOD_GROUPS }),
);

publicRouter.get("/donors/:group", async (req, res) => {
  const g = BLOOD_GROUPS.find((x) => x.slug === req.params.group);
  if (!g) return res.status(404).json({ error: "Not found" });
  const donors = await prisma.bloodDonor.findMany({
    where: { group: g.label },
    include: { district: { select: { name: true, nameEn: true } } },
    orderBy: { createdAt: "asc" },
  });
  res.json({ group: g, donors });
});

publicRouter.get("/settings", async (_req, res) => {
  const row = await prisma.siteSetting.findUnique({ where: { key: "site" } });
  res.json({ settings: row?.value ?? {} });
});

const subscribeSchema = z.object({ email: z.string().email() });

publicRouter.post("/subscribe", async (req, res) => {
  const parsed = subscribeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "সঠিক ইমেইল দিন" });
  await prisma.subscriber
    .upsert({
      where: { email: parsed.data.email },
      update: { active: true },
      create: { email: parsed.data.email },
    })
    .catch(() => null);
  res.json({ ok: true });
});

publicRouter.get("/categories", async (_req, res) => {
  const categories = await prisma.category.findMany({
    where: { visible: true },
    orderBy: { order: "asc" },
  });
  res.json({ categories });
});

const CAT_SELECT = { select: { name: true, nameEn: true, slug: true } };

publicRouter.get("/homepage", async (_req, res) => {
  const latest = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 12,
    include: { category: CAT_SELECT },
  });

  // Hero: an explicitly pinned article wins; else newest featured; else newest.
  const pinnedHero = await prisma.article.findFirst({
    where: { status: "PUBLISHED", isHero: true },
    orderBy: { publishedAt: "desc" },
    include: { category: CAT_SELECT },
  });

  const featured = await prisma.article.findMany({
    where: { status: "PUBLISHED", featured: true },
    orderBy: { publishedAt: "desc" },
    take: 8,
    include: { category: CAT_SELECT },
  });

  const hero = pinnedHero ?? featured[0] ?? latest[0] ?? null;
  let topStories = featured.filter((a) => a.id !== hero?.id).slice(0, 5);
  // fall back to latest if not enough featured articles
  if (topStories.length < 4) {
    const extra = latest.filter(
      (a) => a.id !== hero?.id && !topStories.some((t) => t.id === a.id),
    );
    topStories = [...topStories, ...extra].slice(0, 5);
  }

  // Configured sections, else fall back to every visible category.
  const configs = await prisma.homepageSection.findMany({
    where: { visible: true, categoryId: { not: null } },
    orderBy: { order: "asc" },
    include: { category: CAT_SELECT },
  });

  let plan: { categoryId: string; cardCount: number }[];
  if (configs.length > 0) {
    plan = configs.map((c) => ({
      categoryId: c.categoryId as string,
      cardCount: c.cardCount || 6,
    }));
  } else {
    const cats = await prisma.category.findMany({
      where: { visible: true },
      orderBy: { order: "asc" },
    });
    plan = cats.map((c) => ({ categoryId: c.id, cardCount: 6 }));
  }

  const sections = [];
  for (const p of plan) {
    const articles = await prisma.article.findMany({
      where: { status: "PUBLISHED", categoryId: p.categoryId },
      // lead first, then manual order (homeRank), then newest
      orderBy: [
        { sectionLead: "desc" },
        { homeRank: { sort: "asc", nulls: "last" } },
        { publishedAt: "desc" },
      ],
      take: p.cardCount,
      include: { category: CAT_SELECT },
    });
    if (articles.length >= 2)
      sections.push({ category: articles[0].category, articles });
    if (sections.length >= 14) break;
  }

  res.json({ hero, topStories, latest, sections });
});

publicRouter.get("/livetv", async (_req, res) => {
  const live = await prisma.liveTvSetting.findUnique({
    where: { id: "live-tv" },
  });
  res.json({ live });
});

publicRouter.get("/breaking", async (_req, res) => {
  const items = await prisma.breakingItem.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });
  res.json({ items });
});

publicRouter.get("/articles", async (req, res) => {
  const { category, q, from, to, page = "1", limit = "12" } =
    req.query as Record<string, string>;
  const take = Math.min(Number(limit) || 12, 50);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { status: "PUBLISHED" };
  if (category) where.category = { slug: category };
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { titleEn: { contains: q, mode: "insensitive" } },
      { excerpt: { contains: q, mode: "insensitive" } },
      { excerptEn: { contains: q, mode: "insensitive" } },
      { body: { contains: q, mode: "insensitive" } },
      { tags: { some: { name: { contains: q, mode: "insensitive" } } } },
    ];
  }
  if (from || to) {
    where.publishedAt = {};
    if (from) where.publishedAt.gte = new Date(from);
    if (to) where.publishedAt.lte = new Date(`${to}T23:59:59.999Z`);
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: { category: { select: { name: true, nameEn: true, slug: true } } },
      orderBy: { publishedAt: "desc" },
      skip,
      take,
    }),
    prisma.article.count({ where }),
  ]);

  res.json({ articles, total, page: Number(page), limit: take });
});

// Increment view count (called once per reader session from the article page).
publicRouter.post("/articles/:slug/view", async (req, res) => {
  await prisma.article
    .updateMany({
      where: { slug: req.params.slug, status: "PUBLISHED" },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => null);
  res.json({ ok: true });
});

// --- Comments ---
publicRouter.get("/articles/:slug/comments", async (req, res) => {
  const article = await prisma.article.findUnique({
    where: { slug: req.params.slug },
    select: { id: true },
  });
  if (!article) return res.json({ comments: [] });
  const comments = await prisma.comment.findMany({
    where: { articleId: article.id, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, body: true, createdAt: true },
  });
  res.json({ comments });
});

const commentSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email().optional().or(z.literal("")),
  body: z.string().min(1).max(2000),
});

publicRouter.post("/articles/:slug/comments", async (req, res) => {
  const article = await prisma.article.findFirst({
    where: { slug: req.params.slug, status: "PUBLISHED" },
    select: { id: true },
  });
  if (!article) return res.status(404).json({ error: "Not found" });
  const parsed = commentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "সঠিক তথ্য দিন" });
  await prisma.comment.create({
    data: {
      articleId: article.id,
      name: parsed.data.name,
      email: parsed.data.email || null,
      body: parsed.data.body,
    },
  });
  // Notify the admin moderation panel (and any listening browsers) in realtime.
  emitChange({ type: "comment" });
  res.json({ ok: true });
});

publicRouter.get("/articles/:slug", async (req, res) => {
  const article = await prisma.article.findFirst({
    where: { slug: req.params.slug, status: "PUBLISHED" },
    include: {
      category: { select: { name: true, nameEn: true, slug: true } },
      author: { select: { name: true } },
      tags: { select: { name: true, nameEn: true, slug: true } },
    },
  });
  if (!article) return res.status(404).json({ error: "Not found" });
  res.json({ article });
});

// --- Tags ---
publicRouter.get("/tags", async (_req, res) => {
  const tags = await prisma.tag.findMany({
    where: { articles: { some: { status: "PUBLISHED" } } },
    orderBy: { name: "asc" },
    select: { name: true, nameEn: true, slug: true },
  });
  res.json({ tags });
});

publicRouter.get("/tags/:slug", async (req, res) => {
  const tag = await prisma.tag.findUnique({ where: { slug: req.params.slug } });
  if (!tag) return res.status(404).json({ error: "Not found" });
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED", tags: { some: { slug: req.params.slug } } },
    include: { category: CAT_SELECT },
    orderBy: { publishedAt: "desc" },
    take: 48,
  });
  res.json({ tag, articles });
});
