"use client";

import { Hash } from "lucide-react";
import { ArticleCard } from "@/components/home/ArticleCard";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Article } from "@/types/content";
import type { ApiTag } from "@/lib/api";

export function TagListing({ tag, items }: { tag: ApiTag; items: Article[] }) {
  const { locale, t } = useLocale();
  const label = locale === "en" ? tag.nameEn : tag.name;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="flex items-center gap-1.5 border-b-2 border-border pb-2 text-2xl font-bold text-heading">
        <Hash className="h-6 w-6 text-brand-crimson" />
        {label}
      </h1>

      {items.length === 0 ? (
        <p className="py-12 text-center font-ui text-sm text-foreground-muted">
          {t("noResultsFound")}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
          {items.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
