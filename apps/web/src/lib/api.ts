import type { Article } from "@/types/content";

// Server-side base URL: the Next server calls the API over localhost on the
// same VPS. Client components use NEXT_PUBLIC_API_URL instead.
const API_INTERNAL =
  process.env.API_INTERNAL_URL ?? "http://127.0.0.1:4100";

export interface ApiArticle {
  id: string;
  title: string;
  titleEn: string;
  slug: string;
  excerpt: string;
  excerptEn: string;
  body?: string;
  bodyEn?: string;
  imageTone: string;
  featuredImage?: string | null;
  isBreaking: boolean;
  featured?: boolean;
  viewCount: number;
  authorName?: string | null;
  publishedAt: string | null;
  category?: { name: string; nameEn: string; slug: string } | null;
  author?: { name: string } | null;
  tags?: { name: string; nameEn: string; slug: string }[];
}

export interface ApiTag {
  name: string;
  nameEn: string;
  slug: string;
}

export interface ApiCategory {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
}

export async function apiGet<T>(path: string): Promise<T | null> {
  try {
    // Always fresh so realtime refreshes show the latest content.
    const res = await fetch(`${API_INTERNAL}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

const TONES = ["navy", "crimson", "slate", "amber"];

export function toArticle(a: ApiArticle): Article {
  const cat = a.category ?? { name: "", nameEn: "", slug: "" };
  return {
    id: a.id,
    title: a.title,
    titleEn: a.titleEn,
    slug: a.slug,
    excerpt: a.excerpt,
    excerptEn: a.excerptEn,
    category: { id: cat.slug, name: cat.name, nameEn: cat.nameEn, slug: cat.slug },
    author: a.authorName ?? a.author?.name ?? "",
    publishedAt: a.publishedAt ?? "",
    imageTone: (TONES.includes(a.imageTone)
      ? a.imageTone
      : "navy") as Article["imageTone"],
    featuredImage: a.featuredImage ?? null,
    isBreaking: a.isBreaking,
    viewCount: a.viewCount,
  };
}

export async function getCategories(): Promise<ApiCategory[]> {
  const data = await apiGet<{ categories: ApiCategory[] }>("/api/categories");
  return data?.categories ?? [];
}

export async function getArticleBySlug(slug: string): Promise<ApiArticle | null> {
  const data = await apiGet<{ article: ApiArticle }>(
    `/api/articles/${encodeURIComponent(slug)}`,
  );
  return data?.article ?? null;
}

export async function getArticles(
  params: {
    category?: string;
    limit?: number;
    page?: number;
    q?: string;
    from?: string;
    to?: string;
  } = {},
): Promise<{ articles: ApiArticle[]; total: number }> {
  const q = new URLSearchParams();
  if (params.category) q.set("category", params.category);
  if (params.limit) q.set("limit", String(params.limit));
  if (params.page) q.set("page", String(params.page));
  if (params.q) q.set("q", params.q);
  if (params.from) q.set("from", params.from);
  if (params.to) q.set("to", params.to);
  const data = await apiGet<{ articles: ApiArticle[]; total: number }>(
    `/api/articles?${q.toString()}`,
  );
  return { articles: data?.articles ?? [], total: data?.total ?? 0 };
}

export interface HomepageData {
  hero: ApiArticle | null;
  topStories: ApiArticle[];
  latest: ApiArticle[];
  sections: {
    category: { name: string; nameEn: string; slug: string };
    articles: ApiArticle[];
  }[];
}

export async function getHomepage(): Promise<HomepageData> {
  const data = await apiGet<HomepageData>("/api/homepage");
  return data ?? { hero: null, topStories: [], latest: [], sections: [] };
}

// --- Directories ---
export interface ApiLawyer {
  id: string;
  name: string;
  spec: string;
  specEn: string;
  phone: string;
  chamber?: string | null;
}

export interface ApiDonor {
  id: string;
  name: string;
  phone: string;
  lastDonation: string | null;
  district: { name: string; nameEn: string } | null;
}

export interface ApiEdition {
  id: string;
  date: string;
  pdfUrl: string;
  thumbnail: string | null;
}

export async function getEpaperEditions(): Promise<ApiEdition[]> {
  const d = await apiGet<{ editions: ApiEdition[] }>("/api/epaper");
  return d?.editions ?? [];
}

export async function getTag(
  slug: string,
): Promise<{ tag: ApiTag; articles: ApiArticle[] } | null> {
  return apiGet<{ tag: ApiTag; articles: ApiArticle[] }>(
    `/api/tags/${encodeURIComponent(slug)}`,
  );
}

export async function getLawyers(district: string): Promise<ApiLawyer[]> {
  const d = await apiGet<{ lawyers: ApiLawyer[] }>(
    `/api/lawyers/${encodeURIComponent(district)}`,
  );
  return d?.lawyers ?? [];
}

export async function getDonors(group: string): Promise<ApiDonor[]> {
  const d = await apiGet<{ donors: ApiDonor[] }>(
    `/api/donors/${encodeURIComponent(group)}`,
  );
  return d?.donors ?? [];
}

// Sidebar: most-read (by views) and latest, derived from recent articles.
export async function getSidebar(): Promise<{
  mostRead: Article[];
  latest: Article[];
}> {
  const { articles } = await getArticles({ limit: 12 });
  const mapped = articles.map(toArticle);
  const mostRead = [...mapped]
    .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
    .slice(0, 5);
  return { mostRead, latest: mapped.slice(0, 5) };
}
