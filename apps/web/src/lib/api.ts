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
  isBreaking: boolean;
  featured?: boolean;
  viewCount: number;
  authorName?: string | null;
  publishedAt: string | null;
  category?: { name: string; nameEn: string; slug: string } | null;
  author?: { name: string } | null;
}

export interface ApiCategory {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
}

export async function apiGet<T>(
  path: string,
  revalidate = 60,
): Promise<T | null> {
  try {
    const res = await fetch(`${API_INTERNAL}${path}`, { next: { revalidate } });
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
  params: { category?: string; limit?: number; page?: number } = {},
): Promise<{ articles: ApiArticle[]; total: number }> {
  const q = new URLSearchParams();
  if (params.category) q.set("category", params.category);
  if (params.limit) q.set("limit", String(params.limit));
  if (params.page) q.set("page", String(params.page));
  const data = await apiGet<{ articles: ApiArticle[]; total: number }>(
    `/api/articles?${q.toString()}`,
  );
  return { articles: data?.articles ?? [], total: data?.total ?? 0 };
}

export interface HomepageData {
  hero: ApiArticle | null;
  latest: ApiArticle[];
  sections: {
    category: { name: string; nameEn: string; slug: string };
    articles: ApiArticle[];
  }[];
}

export async function getHomepage(): Promise<HomepageData> {
  const data = await apiGet<HomepageData>("/api/homepage");
  return data ?? { hero: null, latest: [], sections: [] };
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
