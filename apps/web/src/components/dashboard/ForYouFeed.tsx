"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFollowedTopics } from "@/lib/auth-storage";
import { API_BASE } from "@/lib/admin-api";
import { useLocale } from "@/components/providers/LocaleProvider";

interface FeedItem {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  publishedAt: string | null;
  category?: { name: string; nameEn: string; slug: string } | null;
}

export function ForYouFeed({ limit }: { limit?: number }) {
  const { t, locale } = useLocale();
  const [articles, setArticles] = useState<FeedItem[]>([]);
  const [hasFollows, setHasFollows] = useState(true);

  // Real published articles from the followed categories — nothing is shown
  // until the newsroom has actually published in one of them.
  useEffect(() => {
    const follows = getFollowedTopics();
    setHasFollows(follows.length > 0);
    if (!follows.length) {
      setArticles([]);
      return;
    }

    let cancelled = false;
    Promise.all(
      follows.map((slug) =>
        fetch(`${API_BASE}/api/articles?category=${encodeURIComponent(slug)}&limit=6`)
          .then((r) => (r.ok ? r.json() : { articles: [] }))
          .then((d) => (Array.isArray(d.articles) ? (d.articles as FeedItem[]) : []))
          .catch(() => [] as FeedItem[]),
      ),
    ).then((lists) => {
      if (cancelled) return;
      const merged = lists
        .flat()
        .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
      setArticles(limit ? merged.slice(0, limit) : merged);
    });

    return () => {
      cancelled = true;
    };
  }, [limit]);

  return (
    <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
      <h2 className="text-lg font-bold text-heading">{t("forYou")}</h2>

      {!hasFollows || articles.length === 0 ? (
        <p className="mt-3 font-ui text-sm text-foreground-muted">
          {t("forYouEmpty")}
        </p>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-border">
          {articles.map((article) => (
            <li key={article.id} className="py-3 first:pt-0 last:pb-0">
              <Link href={`/${article.slug}`} className="group block">
                {article.category && (
                  <span className="font-ui text-xs font-semibold uppercase tracking-wide text-brand-crimson">
                    {locale === "en"
                      ? article.category.nameEn || article.category.name
                      : article.category.name}
                  </span>
                )}
                <p className="mt-0.5 text-sm font-medium text-foreground transition-colors group-hover:text-brand-crimson">
                  {locale === "en" ? article.titleEn || article.title : article.title}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
