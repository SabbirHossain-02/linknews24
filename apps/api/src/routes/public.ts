import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { BLOOD_GROUPS } from "../lib/blood";
import { emitChange, emitAnalytics } from "../realtime";
import { clientIp, geoLookup, parseUA } from "../lib/analytics";
import { AD_SLOTS } from "../lib/adSlots";
import { readViewerAccount } from "../middleware/account";
import { donorBadge, nextEligibleDate, isEligibleNow } from "../lib/donorBadge";

export const publicRouter = Router();

// --- Directories ---
publicRouter.get("/districts", async (_req, res) => {
  const districts = await prisma.district.findMany({ orderBy: { name: "asc" } });
  res.json({ districts });
});

/** Every approved lawyer, for the "all districts" view. */
publicRouter.get("/lawyers", async (_req, res) => {
  const lawyers = await prisma.lawyer.findMany({
    where: { status: "APPROVED" },
    include: { district: { select: { name: true, nameEn: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ lawyers });
});

publicRouter.get("/lawyers/:district", async (req, res) => {
  const district = await prisma.district.findUnique({
    where: { slug: req.params.district },
  });
  if (!district) return res.status(404).json({ error: "Not found" });
  const lawyers = await prisma.lawyer.findMany({
    // Reader submissions only appear once an admin has approved them.
    where: { districtId: district.id, status: "APPROVED" },
    include: { district: { select: { name: true, nameEn: true, slug: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ district, lawyers });
});

/* ------------------------------------------------------------- hospitals */

publicRouter.get("/hospitals", async (req, res) => {
  const { district, type } = req.query as Record<string, string>;

  const hospitals = await prisma.hospital.findMany({
    where: {
      status: "APPROVED",
      ...(district ? { district: { slug: district } } : {}),
      ...(type ? { type } : {}),
    },
    include: { district: { select: { name: true, nameEn: true, slug: true } } },
    // Emergency lines first — that is what someone searching at 3am needs.
    orderBy: [{ emergency24: "desc" }, { name: "asc" }],
  });

  res.json({ hospitals });
});

publicRouter.get("/blood-groups", (_req, res) =>
  res.json({ groups: BLOOD_GROUPS }),
);

/**
 * The blood-donor feed.
 *
 * Returns each approved donor as a post-shaped record: their badge (never a
 * raw donation count — see lib/donorBadge), their like tally, whether they can
 * give again yet and the date they next can. `viewer` is the reader's account
 * id when signed in, so the feed can show their own like state.
 */
async function donorFeed(where: Record<string, unknown>, viewer?: string) {
  const donors = await prisma.bloodDonor.findMany({
    where: { ...where, status: "APPROVED" },
    include: {
      district: { select: { name: true, nameEn: true, slug: true } },
      _count: { select: { donations: true, likes: true } },
      ...(viewer
        ? { likes: { where: { accountId: viewer }, select: { id: true } } }
        : {}),
    },
    orderBy: [{ donations: { _count: "desc" } }, { createdAt: "desc" }],
  });

  return donors.map((donor) => {
    const { _count, likes, ...rest } = donor as typeof donor & {
      likes?: { id: string }[];
    };
    return {
      ...rest,
      badge: donorBadge(_count.donations),
      likes: _count.likes,
      likedByMe: Boolean(likes?.length),
      nextEligible: nextEligibleDate(donor.lastDonation),
      eligibleNow: isEligibleNow(donor.lastDonation),
    };
  });
}

publicRouter.get("/donors/:group", async (req, res) => {
  const g = BLOOD_GROUPS.find((x) => x.slug === req.params.group);
  if (!g) return res.status(404).json({ error: "Not found" });

  const viewer = readViewerAccount(req);
  const { district } = req.query as Record<string, string>;

  const donors = await donorFeed(
    {
      group: g.label,
      ...(district ? { district: { slug: district } } : {}),
    },
    viewer,
  );

  res.json({ group: g, donors });
});

/** The whole feed, for the "রক্ত সেবা" landing page. */
publicRouter.get("/donors", async (req, res) => {
  const viewer = readViewerAccount(req);
  const { district, group } = req.query as Record<string, string>;
  const matched = group
    ? BLOOD_GROUPS.find((x) => x.slug === group || x.label === group)
    : null;

  const donors = await donorFeed(
    {
      ...(matched ? { group: matched.label } : {}),
      ...(district ? { district: { slug: district } } : {}),
    },
    viewer,
  );

  res.json({ donors });
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

/**
 * A category's own id plus every category nested under it.
 *
 * Asking for "জাতীয়" should return what is filed under জাতীয় *and* under its
 * sub-categories — a reader opening the parent expects everything beneath it,
 * not an empty-looking page while the stories sit one level down. Returns null
 * when the slug matches no category.
 */
async function categoryIdsFor(slug: string): Promise<string[] | null> {
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (!category) return null;

  const children = await prisma.category.findMany({
    where: { parentId: category.id },
    select: { id: true },
  });
  return [category.id, ...children.map((c) => c.id)];
}

/** The same expansion by id, for the homepage sections. */
async function withChildIds(categoryId: string): Promise<string[]> {
  const children = await prisma.category.findMany({
    where: { parentId: categoryId },
    select: { id: true },
  });
  return [categoryId, ...children.map((c) => c.id)];
}

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
    // Only top-level categories get their own row — a sub-category's stories
    // already appear inside its parent's row, so listing it again would repeat
    // the same articles twice on the homepage.
    const cats = await prisma.category.findMany({
      where: { visible: true, parentId: null },
      orderBy: { order: "asc" },
    });
    plan = cats.map((c) => ({ categoryId: c.id, cardCount: 6 }));
  }

  const sections = [];
  for (const p of plan) {
    const articles = await prisma.article.findMany({
      // A homepage row for a parent category shows its sub-categories too.
      where: {
        status: "PUBLISHED",
        categoryId: { in: await withChildIds(p.categoryId) },
      },
      // lead first, then manual order (homeRank), then newest
      orderBy: [
        { sectionLead: "desc" },
        { homeRank: { sort: "asc", nulls: "last" } },
        { publishedAt: "desc" },
      ],
      take: p.cardCount,
      include: { category: CAT_SELECT },
    });
    if (articles.length >= 2) {
      // Label the row with the category the row is *for*, not with whichever
      // article happens to be first — that could be a sub-category's.
      const heading = await prisma.category.findUnique({
        where: { id: p.categoryId },
        ...CAT_SELECT,
      });
      if (heading) sections.push({ category: heading, articles });
    }
    if (sections.length >= 14) break;
  }

  res.json({ hero, topStories, latest, sections });
});

// --- Analytics: record a page view ---
const trackSchema = z.object({
  path: z.string().min(1).max(400),
  referrer: z.string().max(400).optional(),
});

publicRouter.post("/track", async (req, res) => {
  const parsed = trackSchema.safeParse(req.body);
  if (!parsed.success) return res.status(204).end();
  // Ignore admin/dashboard traffic.
  if (parsed.data.path.startsWith("/admin")) return res.status(204).end();

  const ip = clientIp(req.headers as Record<string, unknown>, req.socket.remoteAddress);
  const { device, browser, os } = parseUA(req.get("user-agent") || "");
  const { country, city } = geoLookup(ip);
  // Store only the referring host (e.g. "google.com") for clean breakdowns.
  let referrer: string | null = null;
  if (parsed.data.referrer) {
    try {
      referrer = new URL(parsed.data.referrer).hostname.replace(/^www\./, "") || null;
    } catch {
      referrer = null;
    }
  }

  await prisma.pageView
    .create({
      data: { path: parsed.data.path, referrer, device, browser, os, ip, country, city },
    })
    .catch(() => null);
  emitAnalytics({ type: "visit" });
  res.status(204).end();
});

// --- Ad slot catalogue + pricing ---
publicRouter.get("/ad-slots", (_req, res) => {
  res.json({ slots: AD_SLOTS });
});

// --- Ads: serve active ads by placement + track impression/click ---
publicRouter.get("/ads", async (req, res) => {
  const { placement } = req.query as Record<string, string>;
  const now = new Date();
  const ads = await prisma.ad.findMany({
    where: {
      active: true,
      status: "ACTIVE",
      placement: placement ? (placement as never) : undefined,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    select: { id: true, name: true, imageUrl: true, linkUrl: true, placement: true },
    orderBy: { createdAt: "desc" },
  });
  res.json({ ads });
});

publicRouter.post("/ads/:id/impression", async (req, res) => {
  await prisma.ad
    .update({ where: { id: req.params.id }, data: { impressions: { increment: 1 } } })
    .catch(() => null);
  emitAnalytics({ type: "ad" });
  res.status(204).end();
});

publicRouter.post("/ads/:id/click", async (req, res) => {
  await prisma.ad
    .update({ where: { id: req.params.id }, data: { clicks: { increment: 1 } } })
    .catch(() => null);
  emitAnalytics({ type: "ad" });
  res.status(204).end();
});

// --- E-Paper ---
publicRouter.get("/epaper", async (_req, res) => {
  const editions = await prisma.epaperEdition.findMany({
    where: { published: true },
    orderBy: { date: "desc" },
    take: 60,
    select: { id: true, date: true, pdfUrl: true, thumbnail: true },
  });
  res.json({ editions });
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
  if (category) {
    const ids = await categoryIdsFor(category);
    if (!ids)
      return res.json({ articles: [], total: 0, page: Number(page) || 1, limit: take });
    where.categoryId = { in: ids };
  }
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
