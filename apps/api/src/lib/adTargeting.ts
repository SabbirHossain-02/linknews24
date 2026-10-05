import type { Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { normalizeSlug } from "./slug";

/**
 * Which ads belong on which page.
 *
 * An ad runs on the whole site, the homepage, one category (optionally its
 * stories too) or one story. A page shows its most specific ad for each slot:
 * a story's own ad beats its category's, which beats a site-wide one — the
 * advertiser who paid for this exact page gets it.
 */

export type TargetType = "ALL" | "HOME" | "CATEGORY" | "ARTICLE";

/** What a public page is, worked out from its path. */
export type PageContext =
  | { kind: "HOME" }
  | { kind: "CATEGORY"; slug: string }
  | { kind: "ARTICLE"; slug: string; categorySlug: string }
  | { kind: "OTHER" };

// Paths repeat on every slot of every page view; a short cache keeps that to
// one lookup a minute per page.
const CACHE_MS = 60_000;
const cache = new Map<string, { at: number; ctx: PageContext }>();

/** "/খেলাধুলা" → that category; "/some-story" → that story; "/" → home. */
export async function pageContext(rawPath: string): Promise<PageContext> {
  const path = cleanPath(rawPath);
  if (path === null) return { kind: "OTHER" };
  if (path === "") return { kind: "HOME" };

  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.ctx;

  let ctx: PageContext = { kind: "OTHER" };
  // A single segment is the catch-all route: a category, else a story.
  if (!path.includes("/")) {
    const category = await prisma.category.findUnique({
      where: { slug: path },
      select: { slug: true },
    });
    if (category) ctx = { kind: "CATEGORY", slug: category.slug };
    else {
      const article = await prisma.article.findFirst({
        where: { slug: path, status: "PUBLISHED" },
        select: { slug: true, category: { select: { slug: true } } },
      });
      if (article)
        ctx = { kind: "ARTICLE", slug: article.slug, categorySlug: article.category.slug };
    }
  }
  if (cache.size > 2000) cache.clear();
  cache.set(path, { at: Date.now(), ctx });
  return ctx;
}

/** The path of a page, decoded and normalised; null for anything not a page. */
function cleanPath(input: string): string | null {
  let p = input.trim();
  if (!p) return "";
  try {
    if (/^https?:\/\//i.test(p)) p = new URL(p).pathname;
  } catch {
    return null;
  }
  p = p.split(/[?#]/)[0];
  try {
    p = decodeURIComponent(p);
  } catch {
    /* already decoded */
  }
  return normalizeSlug(p.replace(/^\/+|\/+$/g, ""));
}

/**
 * A link pasted into the booking form, turned into a target the system can
 * use — or an explanation of why that page cannot carry its own ad.
 */
export async function resolveTargetUrl(
  url: string,
): Promise<
  | { ok: true; type: TargetType; slug: string | null; label: string; labelEn: string }
  | { ok: false; error: string }
> {
  const ctx = await pageContext(url);
  if (ctx.kind === "HOME")
    return { ok: true, type: "HOME", slug: null, label: "হোমপেজ", labelEn: "Homepage" };
  if (ctx.kind === "CATEGORY") {
    const c = await prisma.category.findUnique({
      where: { slug: ctx.slug },
      select: { name: true, nameEn: true },
    });
    return { ok: true, type: "CATEGORY", slug: ctx.slug, label: c?.name ?? ctx.slug, labelEn: c?.nameEn ?? ctx.slug };
  }
  if (ctx.kind === "ARTICLE") {
    const a = await prisma.article.findFirst({
      where: { slug: ctx.slug },
      select: { title: true, titleEn: true },
    });
    return { ok: true, type: "ARTICLE", slug: ctx.slug, label: a?.title ?? ctx.slug, labelEn: a?.titleEn || a?.title || ctx.slug };
  }
  return {
    ok: false,
    error: "এই লিংকটি চেনা যায়নি — হোমপেজ, কোনো বিভাগ বা প্রকাশিত খবরের লিংক দিন",
  };
}

/** Checks a requested target exists, and gives the label to store with it. */
export async function validateTarget(
  type: TargetType,
  slug: string | null | undefined,
): Promise<{ ok: true; slug: string | null; label: string } | { ok: false; error: string }> {
  if (type === "ALL") return { ok: true, slug: null, label: "পুরো সাইট" };
  if (type === "HOME") return { ok: true, slug: null, label: "হোমপেজ" };
  const s = normalizeSlug(slug ?? "");
  if (!s) return { ok: false, error: "কোন পাতায় দেখাবে তা বেছে নিন" };
  if (type === "CATEGORY") {
    const c = await prisma.category.findUnique({ where: { slug: s }, select: { name: true } });
    return c ? { ok: true, slug: s, label: c.name } : { ok: false, error: "বিভাগটি পাওয়া যায়নি" };
  }
  const a = await prisma.article.findFirst({
    where: { slug: s, status: "PUBLISHED" },
    select: { title: true },
  });
  return a ? { ok: true, slug: s, label: a.title } : { ok: false, error: "খবরটি পাওয়া যায়নি" };
}

/**
 * The ads that may show on a page, best match first: each condition is tried
 * in turn, and the first that has any ad wins.
 */
export function targetTiers(ctx: PageContext): Prisma.AdWhereInput[] {
  const all: Prisma.AdWhereInput = { targetType: "ALL" };
  switch (ctx.kind) {
    case "HOME":
      return [{ targetType: "HOME" }, all];
    case "CATEGORY":
      return [{ targetType: "CATEGORY", targetSlug: ctx.slug }, all];
    case "ARTICLE":
      return [
        { targetType: "ARTICLE", targetSlug: ctx.slug },
        {
          targetType: "CATEGORY",
          targetSlug: ctx.categorySlug,
          targetIncludesArticles: true,
        },
        all,
      ];
    default:
      return [all];
  }
}

/**
 * Another booking holding the same slot on the same page at the same time.
 * A site-wide ad and a page's own ad do not clash — the page's own one simply
 * shows there instead.
 */
export async function findClash(opts: {
  placement: string;
  targetType: TargetType;
  targetSlug: string | null;
  start: Date;
  end: Date;
  excludeId?: string;
}) {
  return prisma.ad.findFirst({
    where: {
      id: opts.excludeId ? { not: opts.excludeId } : undefined,
      placement: opts.placement as never,
      targetType: opts.targetType,
      targetSlug: opts.targetSlug,
      status: { in: ["PENDING", "ACTIVE"] },
      startsAt: { lt: opts.end },
      endsAt: { gt: opts.start },
    },
    orderBy: { endsAt: "desc" },
    select: { id: true, name: true, endsAt: true },
  });
}
