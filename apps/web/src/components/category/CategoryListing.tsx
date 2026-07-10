"use client";

import Link from "next/link";
import { Pagination } from "@/components/home/Pagination";
import { toneGradientClass } from "@/lib/tone";
import { localizedAuthor, localizedName, localizedPublishedAt } from "@/lib/i18n";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Article, Category } from "@/types/content";

function ArticleRow({ article }: { article: Article }) {
  const { locale } = useLocale();

  return (
    <Link href={`/${article.slug}`} className="group flex gap-4 py-4">
      <div
        className={`relative h-20 w-28 shrink-0 overflow-hidden rounded md:h-24 md:w-36 ${toneGradientClass(
          article.imageTone,
        )}`}
      >
        {article.featuredImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.featuredImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>
      <div className="min-w-0">
        <span className="font-ui text-[11px] font-semibold uppercase tracking-wide text-brand-crimson">
          {localizedName(article.category, locale)}
        </span>
        <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-foreground transition-colors group-hover:text-brand-crimson">
          {locale === "en" ? article.titleEn : article.title}
        </h3>
        {(locale === "en" ? article.excerptEn : article.excerpt) && (
          <p className="mt-1 line-clamp-1 hidden text-sm text-foreground-muted sm:block">
            {locale === "en" ? article.excerptEn : article.excerpt}
          </p>
        )}
        <p className="mt-1 font-ui text-xs text-foreground-muted">
          {localizedAuthor(article.author, locale)} ·{" "}
          {localizedPublishedAt(article.publishedAt, locale)}
        </p>
      </div>
    </Link>
  );
}

export function CategoryListing({
  category,
  items,
  currentPage,
  totalPages,
}: {
  category: Category;
  items: Article[];
  currentPage: number;
  totalPages: number;
}) {
  const { locale } = useLocale();
  const categoryLabel = localizedName(category, locale);
  const showLead = currentPage === 1 && items.length > 0;
  const lead = showLead ? items[0] : undefined;
  const rest = showLead ? items.slice(1) : items;

  return (
    <div className="flex flex-col gap-2">
      <h1 className="border-b-2 border-border pb-2 text-2xl font-bold text-heading">
        {categoryLabel}
      </h1>

      {items.length === 0 ? (
        <p className="py-12 text-center font-ui text-sm text-foreground-muted">
          {locale === "bn"
            ? `এই মুহূর্তে ${categoryLabel} বিভাগে কোনো সংবাদ নেই।`
            : `There's no news in ${categoryLabel} right now.`}
        </p>
      ) : (
        <>
          {lead && (
            <Link href={`/${lead.slug}`} className="group block border-b border-border pb-5 pt-4">
              <div
                className={`relative aspect-[21/9] w-full overflow-hidden rounded-md ${toneGradientClass(
                  lead.imageTone,
                )}`}
              >
                {lead.featuredImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={lead.featuredImage}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="mt-3">
                <span className="font-ui text-xs font-semibold uppercase tracking-wide text-brand-crimson">
                  {localizedName(lead.category, locale)}
                </span>
                <h2 className="mt-1 text-xl font-bold leading-snug text-foreground transition-colors group-hover:text-brand-crimson">
                  {locale === "en" ? lead.titleEn : lead.title}
                </h2>
                {(locale === "en" ? lead.excerptEn : lead.excerpt) && (
                  <p className="mt-1.5 line-clamp-2 text-sm text-foreground-muted">
                    {locale === "en" ? lead.excerptEn : lead.excerpt}
                  </p>
                )}
                <p className="mt-1.5 font-ui text-xs text-foreground-muted">
                  {localizedAuthor(lead.author, locale)} ·{" "}
                  {localizedPublishedAt(lead.publishedAt, locale)}
                </p>
              </div>
            </Link>
          )}

          <div className="flex flex-col divide-y divide-border">
            {rest.map((article) => (
              <ArticleRow key={article.id} article={article} />
            ))}
          </div>

          <div className="pt-4">
            <Pagination
              basePath={`/${category.slug}`}
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </div>
        </>
      )}
    </div>
  );
}
