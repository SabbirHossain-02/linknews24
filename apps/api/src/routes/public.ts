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
