"use client";

import Link from "next/link";
import type { Article } from "@/types/content";
import { localizedName } from "@/lib/i18n";
import { useLocale } from "@/components/providers/LocaleProvider";

export function TopStoriesList({ articles }: { articles: Article[] }) {
  const { locale, t } = useLocale();

  return (
    <div className="flex h-full flex-col">
      <h2 className="border-b-2 border-border pb-2 text-lg font-bold text-heading">
        {t("moreTopStories")}
      </h2>
      <ul className="flex flex-1 flex-col divide-y divide-border">
        {articles.map((article) => (
          <li key={article.id} className="py-3 first:pt-3 last:pb-0">
            <Link href={`/${article.slug}`} className="group block">
              <span className="font-ui text-xs font-semibold uppercase tracking-wide text-brand-crimson">
                {localizedName(article.category, locale)}
              </span>
              <h3 className="mt-1 text-[15px] font-semibold leading-snug text-foreground transition-colors group-hover:text-brand-crimson">
                {article.title}
              </h3>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
