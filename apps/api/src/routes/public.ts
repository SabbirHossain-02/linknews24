import { Router } from "express";
import { prisma } from "../prisma";

export const publicRouter = Router();

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

  // Hero + "top stories" are driven by the "Feature on homepage" flag.
  const featured = await prisma.article.findMany({
    where: { status: "PUBLISHED", featured: true },
    orderBy: { publishedAt: "desc" },
    take: 8,
    include: { category: CAT_SELECT },
  });

  const hero = featured[0] ?? latest[0] ?? null;
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
      orderBy: { publishedAt: "desc" },
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
  const { category, page = "1", limit = "12" } = req.query as Record<string, string>;
  const take = Math.min(Number(limit) || 12, 50);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;

  const where = {
    status: "PUBLISHED" as const,
    category: category ? { slug: category } : undefined,
  };

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

publicRouter.get("/articles/:slug", async (req, res) => {
  const article = await prisma.article.findFirst({
    where: { slug: req.params.slug, status: "PUBLISHED" },
    include: {
      category: { select: { name: true, nameEn: true, slug: true } },
      author: { select: { name: true } },
    },
  });
  if (!article) return res.status(404).json({ error: "Not found" });
  res.json({ article });
});
