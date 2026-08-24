import { apiGet } from "./api";

/**
 * The SEO settings the admin panel saves. Read here by the root layout, the
 * sitemap and robots.txt, so what is typed on that page is what search engines
 * and social networks actually receive.
 */
export interface SeoSettings {
  siteName: string;
  titleTemplate: string;
  defaultTitle: string;
  defaultTitleEn: string;
  defaultDescription: string;
  defaultDescriptionEn: string;
  keywords: string;
  defaultOgImage: string;
  twitterHandle: string;
  indexable: boolean;
  robotsDisallow: string;
  googleVerification: string;
  bingVerification: string;
  organizationName: string;
  organizationLogo: string;
}

export const SEO_FALLBACK: SeoSettings = {
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

/**
 * If the API is unreachable the site still has to serve a head — the fallback
 * is the same text the settings start out holding, never an empty tag.
 */
export async function getSeo(): Promise<SeoSettings> {
  const data = await apiGet<{ seo: SeoSettings }>("/api/seo");
  return { ...SEO_FALLBACK, ...(data?.seo ?? {}) };
}

/** The Disallow list, one path per line, cleaned of blanks and comments. */
export function disallowList(raw: string): string[] {
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
}
