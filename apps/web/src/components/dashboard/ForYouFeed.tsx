"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFollowedTopics } from "@/lib/auth-storage";
import { allArticles } from "@/lib/mock-data";
import { localizedName } from "@/lib/i18n";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Article } from "@/types/content";

export function ForYouFeed({ limit }: { limit?: number }) {
  const { t, locale } = useLocale();
  const [articles, setArticles] = useState<Article[]>([]);
  const [hasFollows, setHasFollows] = useState(true);

  useEffect(() => {
    const follows = getFollowedTopics();
    setHasFollows(follows.length > 0);
    const feed = allArticles.filter((a) => follows.includes(a.category.slug));
    setArticles(limit ? feed.slice(0, limit) : feed);
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
                <span className="font-ui text-xs font-semibold uppercase tracking-wide text-brand-crimson">
                  {localizedName(article.category, locale)}
                </span>
                <p className="mt-0.5 text-sm font-medium text-foreground transition-colors group-hover:text-brand-crimson">
                  {locale === "en" ? article.titleEn : article.title}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
