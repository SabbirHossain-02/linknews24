import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getArticles, getCategories } from "@/lib/api";

export const revalidate = 3600; // refresh the sitemap hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/search",
    "/epaper",
    "/lawyers",
    "/blood",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "hourly" : "daily",
    priority: path === "" ? 1 : 0.6,
  }));

  // Every published article, in pages of 50 — the cap meant a growing archive
  // silently stopped being listed.
  const [categories, first] = await Promise.all([
    getCategories(),
    getArticles({ limit: 50, page: 1 }),
  ]);

  const articles = [...first.articles];
  const pages = Math.ceil(first.total / 50);
  for (let page = 2; page <= pages; page += 1) {
    const next = await getArticles({ limit: 50, page });
    if (!next.articles.length) break;
    articles.push(...next.articles);
  }

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/${c.slug}`,
    changeFrequency: "hourly",
    priority: 0.7,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/${a.slug}`,
    lastModified: a.publishedAt ? new Date(a.publishedAt) : undefined,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
