"use client";

import Link from "next/link";
import type { Article } from "@/types/content";
import { toneGradientClass } from "@/lib/tone";
import { localizedName } from "@/lib/i18n";
import { useLocale } from "@/components/providers/LocaleProvider";

export function HeroStory({ article }: { article: Article }) {
  const { locale, t } = useLocale();

  return (
    <Link href={`/${article.slug}`} className="group block">
      <div
        className={`relative aspect-[16/8] w-full overflow-hidden rounded-lg ${toneGradientClass(
          article.imageTone,
        )}`}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <div className="flex items-center gap-2">
            {article.isBreaking && (
              <span className="rounded bg-brand-crimson px-2 py-0.5 font-ui text-[11px] font-bold uppercase tracking-wide text-white">
                {t("breaking")}
              </span>
            )}
            <span className="font-ui text-xs font-semibold uppercase tracking-wide text-white/80">
              {localizedName(article.category, locale)}
            </span>
          </div>
          <h1 className="mt-3 max-w-2xl text-2xl font-bold leading-tight text-white transition-colors group-hover:text-white/90 sm:text-3xl md:text-4xl">
            {article.title}
          </h1>
          <p className="mt-3 max-w-xl font-ui text-sm text-white/70 sm:text-base">
            {article.excerpt}
          </p>
          <p className="mt-3 font-ui text-xs text-white/50">
            {article.author} · {article.publishedAt}
          </p>
        </div>
      </div>
    </Link>
  );
}
