"use client";

import { ArticleCard } from "./ArticleCard";
import { SearchForm } from "./SearchForm";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Article } from "@/types/content";

export function SearchResultsView({
  query,
  results,
}: {
  query: string;
  results: Article[];
}) {
  const { locale, t } = useLocale();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-heading">{t("search")}</h1>
      <SearchForm defaultValue={query} />

      {query && (
        <p className="font-ui text-sm text-foreground-muted">
          {locale === "bn" ? (
            <>
              <span className="font-semibold text-foreground">&quot;{query}&quot;</span> এর
              জন্য {results.length} টি ফলাফল পাওয়া গেছে
            </>
          ) : (
            <>
              {results.length} results found for{" "}
              <span className="font-semibold text-foreground">&quot;{query}&quot;</span>
            </>
          )}
        </p>
      )}

      {query && results.length === 0 && (
        <p className="py-12 text-center font-ui text-sm text-foreground-muted">
          {t("noResultsFound")}
        </p>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
          {results.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
