"use client";

import Link from "next/link";
import { SearchAutocomplete } from "./SearchAutocomplete";
import { ArticleCard } from "./ArticleCard";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Article } from "@/types/content";
import type { ApiCategory } from "@/lib/api";

export function SearchResultsView({
  query,
  results,
  total,
  categories,
  selectedCategory,
  from,
  to,
  active,
}: {
  query: string;
  results: Article[];
  /** Every match, not only the ones shown. */
  total: number;
  categories: ApiCategory[];
  selectedCategory: string;
  from: string;
  to: string;
  active: boolean;
}) {
  const { locale, t } = useLocale();

  const inputCls =
    "rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand-crimson focus:outline-none";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-heading">{t("search")}</h1>

      <form action="/search" method="get" className="flex flex-col gap-3">
        <div className="flex gap-2">
          <SearchAutocomplete
            defaultValue={query}
            placeholder={t("searchPlaceholder")}
            autoFocus
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-brand-navy px-5 py-2.5 font-ui text-sm font-medium text-white transition-colors hover:bg-brand-navy-soft"
          >
            {t("searchButton")}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            name="category"
            defaultValue={selectedCategory}
            className={inputCls}
          >
            <option value="">{t("allCategoriesFilter")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {locale === "en" ? c.nameEn : c.name}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-1.5 font-ui text-xs text-foreground-muted">
            {t("dateFrom")}
            <input type="date" name="from" defaultValue={from} className={inputCls} />
          </label>
          <label className="flex items-center gap-1.5 font-ui text-xs text-foreground-muted">
            {t("dateTo")}
            <input type="date" name="to" defaultValue={to} className={inputCls} />
          </label>
          <button
            type="submit"
            className="rounded-lg border border-brand-crimson px-4 py-2.5 font-ui text-sm font-medium text-brand-crimson transition-colors hover:bg-brand-crimson hover:text-white"
          >
            {t("applyFilters")}
          </button>
          {active && (
            <Link
              href="/search"
              className="rounded-lg border border-border px-4 py-2.5 font-ui text-sm text-foreground-muted transition-colors hover:bg-surface"
            >
              {t("clearFilters")}
            </Link>
          )}
        </div>
      </form>

      {!active && (
        <p className="py-12 text-center font-ui text-sm text-foreground-muted">
          {t("searchPrompt")}
        </p>
      )}

      {active && (
        <p className="font-ui text-sm text-foreground-muted">
          {locale === "bn" ? (
            <>
              <span className="font-semibold text-foreground">
                {total.toLocaleString("bn-BD")}
              </span>{" "}
              টি ফলাফল পাওয়া গেছে
              {total > results.length && ` (প্রথম ${results.length.toLocaleString("bn-BD")}টি দেখানো হচ্ছে)`}
            </>
          ) : (
            <>
              <span className="font-semibold text-foreground">{total}</span> results found
              {total > results.length && ` (showing the first ${results.length})`}
            </>
          )}
        </p>
      )}

      {active && results.length === 0 && (
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
