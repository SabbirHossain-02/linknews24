"use client";

import Link from "next/link";
import type { Article } from "@/types/content";
import { useLocale } from "@/components/providers/LocaleProvider";
import { ArticleCard } from "./ArticleCard";

export function ThematicRow({
  title,
  href,
  articles,
}: {
  title: string;
  href: string;
  articles: Article[];
}) {
  const { t } = useLocale();

  return (
    <section>
      <div className="flex items-center justify-between border-b-2 border-border pb-2">
        <h2 className="text-lg font-bold text-heading">{title}</h2>
        <Link
          href={href}
          className="font-ui text-xs font-medium text-brand-crimson hover:underline"
        >
          {t("viewAll")}
        </Link>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
