"use client";

import Link from "next/link";
import type { Article } from "@/types/content";
import { toneGradientClass } from "@/lib/tone";
import { useLocale } from "@/components/providers/LocaleProvider";

export function GalleryStrip({ articles }: { articles: Article[] }) {
  const { t } = useLocale();

  return (
    <section>
      <div className="flex items-center justify-between border-b-2 border-border pb-2">
        <h2 className="text-lg font-bold text-heading">{t("photoGallery")}</h2>
        <Link
          href="/gallery"
          className="font-ui text-xs font-medium text-brand-crimson hover:underline"
        >
          {t("viewAll")}
        </Link>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/${article.slug}`}
            className="group block"
          >
            <div
              className={`relative aspect-square w-full overflow-hidden rounded-md ${toneGradientClass(
                article.imageTone,
              )}`}
            >
              <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
            </div>
            <h3 className="mt-2 text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-brand-crimson">
              {article.title}
            </h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
