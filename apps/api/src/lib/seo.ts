import { prisma } from "../prisma";

/**
 * SEO settings, and an audit of what is actually wrong with the site's pages.
 *
 * Everything here reads or writes something the public site really uses — the
 * settings feed the <head> of every page, the robots rules feed /robots.txt,
 * and the audit is computed from the published articles themselves. Nothing on
 * the SEO page is advice in the abstract: every line names a real page and what
 * is missing from it.
 */

export interface SeoSettings {
  siteName: string;
  titleTemplate: string;
  /** Home page <title> and the fallback for anything without its own. */
  defaultTitle: string;
  defaultTitleEn: string;
  defaultDescription: string;
  defaultDescriptionEn: string;
  keywords: string;
  /** Absolute URL of the image social networks show when a page is shared. */
  defaultOgImage: string;
  twitterHandle: string;
  /** Search engines are asked to stay away entirely while this is off. */
  indexable: boolean;
  /** One path per line, written into robots.txt as Disallow. */
  robotsDisallow: string;
  googleVerification: string;
  bingVerification: string;
  /** Publisher details for the Organisation structured data. */
  organizationName: string;
  organizationLogo: string;
}

export const SEO_KEY = "seo";

export const SEO_DEFAULTS: SeoSettings = {
  siteName: "LinkNews24",
  titleTemplate: "%s | LinkNews24",
  defaultTitle: "LinkNews24 — বাংলাদেশের নির্ভরযোগ্য অনলাইন নিউজ পোর্টাল",
  defaultTitleEn: "LinkNews24 — Trusted online news portal of Bangladesh",
  defaultDescription:
    "জাতীয়, আন্তর্জাতিক, রাজনীতি, খেলা, বিনোদন ও প্রযুক্তির সর্বশেষ খবর — LinkNews24-এ।",
  defaultDescriptionEn:
    "The latest national, international, political, sports, entertainment and technology news — on LinkNews24.",
  keywords: "",
  defaultOgImage: "",
  twitterHandle: "",
  indexable: true,
  robotsDisallow: "/admin\n/dashboard",
  googleVerification: "",
  bingVerification: "",
  organizationName: "LinkNews24",
  organizationLogo: "",
};

export async function readSeo(): Promise<SeoSettings> {
  const row = await prisma.siteSetting.findUnique({ where: { key: SEO_KEY } });
  return { ...SEO_DEFAULTS, ...((row?.value as Partial<SeoSettings>) ?? {}) };
}

export async function writeSeo(patch: Partial<SeoSettings>): Promise<SeoSettings> {
  const next = { ...(await readSeo()), ...patch };
  await prisma.siteSetting.upsert({
    where: { key: SEO_KEY },
    update: { value: next },
    create: { key: SEO_KEY, value: next },
  });
  return next;
}

// --- The audit -------------------------------------------------------------

/** Google truncates a title around here, and a description around 160. */
const TITLE_MAX = 60;
const TITLE_MIN = 20;
const DESC_MAX = 160;
const DESC_MIN = 70;

export type IssueLevel = "error" | "warning";

export interface SeoIssue {
  level: IssueLevel;
  /** Machine name, so the page can group and translate. */
  code: string;
  articleId: string;
  slug: string;
  title: string;
  /** Extra context, e.g. the offending length. */
  detail?: string;
}

/**
 * Reads every published article and reports what would actually hurt it in
 * search results or when shared. Only published articles are checked — a draft
 * search engines cannot see is not an SEO problem.
 */
export async function auditArticles() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    select: {
      id: true,
      slug: true,
      title: true,
      titleEn: true,
      excerpt: true,
      seoTitle: true,
      seoDescription: true,
      featuredImage: true,
      publishedAt: true,
    },
    orderBy: { publishedAt: "desc" },
  });

  const issues: SeoIssue[] = [];
  const add = (
    level: IssueLevel,
    code: string,
    a: (typeof articles)[number],
    detail?: string,
  ) => issues.push({ level, code, articleId: a.id, slug: a.slug, title: a.title, detail });

  // Two articles sharing a title compete with each other in search results.
  const byTitle = new Map<string, number>();
  for (const a of articles) {
    const key = a.title.trim().toLowerCase();
    byTitle.set(key, (byTitle.get(key) ?? 0) + 1);
  }

  for (const a of articles) {
    // What the page ends up showing as its title / description.
    const title = (a.seoTitle || a.title).trim();
    const desc = (a.seoDescription || a.excerpt).trim();

    if (!desc) add("error", "noDescription", a);
    else if (desc.length > DESC_MAX)
      add("warning", "descriptionLong", a, `${desc.length} / ${DESC_MAX}`);
    else if (desc.length < DESC_MIN)
      add("warning", "descriptionShort", a, `${desc.length} / ${DESC_MIN}`);

    if (title.length > TITLE_MAX)
      add("warning", "titleLong", a, `${title.length} / ${TITLE_MAX}`);
    else if (title.length < TITLE_MIN)
      add("warning", "titleShort", a, `${title.length} / ${TITLE_MIN}`);

    // No image means a bare link when the article is shared anywhere.
    if (!a.featuredImage) add("warning", "noImage", a);

    // A missing English title breaks the English view and its metadata.
    if (!a.titleEn?.trim()) add("warning", "noTitleEn", a);

    if (!a.publishedAt) add("error", "noPublishedAt", a);

    if ((byTitle.get(a.title.trim().toLowerCase()) ?? 0) > 1)
      add("warning", "duplicateTitle", a);
  }

  const errors = issues.filter((i) => i.level === "error").length;
  const warnings = issues.length - errors;
  // One point per article, minus what is wrong with it, floored at zero.
  const score =
    articles.length === 0
      ? null
      : Math.max(
          0,
          Math.round(
            ((articles.length * 3 - errors * 3 - warnings) /
              (articles.length * 3)) *
              100,
          ),
        );

  return { checked: articles.length, errors, warnings, score, issues };
}

/** What the sitemap will actually contain, counted from the same source it uses. */
export async function sitemapStats() {
  const [articles, categories] = await Promise.all([
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.category.count({ where: { visible: true } }),
  ]);
  const staticPages = 5; // home, search, epaper, lawyers, blood
  return {
    articles,
    categories,
    staticPages,
    total: articles + categories + staticPages,
  };
}
