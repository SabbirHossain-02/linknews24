"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { ArticleCard } from "./ArticleCard";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Article } from "@/types/content";
import type { ApiCategory } from "@/lib/api";

export function SearchResultsView({
  query,
  results,
  categories,
  selectedCategory,
  from,
  to,
  active,
}: {
  query: string;
  results: Article[];
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
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder={t("searchPlaceholder")}
              autoFocus
              className={`${inputCls} w-full pl-10`}
            />
          </div>
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
              <span className="font-semibold text-foreground">{results.length}</span> টি
              ফলাফল পাওয়া গেছে
            </>
          ) : (
            <>
              <span className="font-semibold text-foreground">{results.length}</span>{" "}
              results found
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
