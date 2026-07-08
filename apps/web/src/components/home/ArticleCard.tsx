"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import type { Article } from "@/types/content";
import { toneGradientClass } from "@/lib/tone";
import {
  localizedAuthor,
  localizedDuration,
  localizedName,
  localizedPublishedAt,
} from "@/lib/i18n";
import { useLocale } from "@/components/providers/LocaleProvider";

export function ArticleCard({ article }: { article: Article }) {
  const { locale } = useLocale();

  return (
    <Link href={`/${article.slug}`} className="group block">
      <div
        className={`relative aspect-video w-full overflow-hidden rounded-md ${toneGradientClass(
          article.imageTone,
        )}`}
      >
        {article.isVideo && (
          <>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 transition-transform group-hover:scale-110">
                <Play className="h-4 w-4 fill-brand-navy text-brand-navy" />
              </div>
            </div>
            {article.videoDuration && (
              <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 font-ui text-[11px] text-white">
                {localizedDuration(article.videoDuration, locale)}
              </span>
            )}
          </>
        )}
      </div>

      <div className="mt-2.5">
        <span className="font-ui text-xs font-semibold uppercase tracking-wide text-brand-crimson">
          {localizedName(article.category, locale)}
        </span>
        <h3 className="mt-1 text-[15px] font-semibold leading-snug text-foreground transition-colors group-hover:text-brand-crimson">
          {locale === "en" ? article.titleEn : article.title}
        </h3>
        <p className="mt-1 font-ui text-xs text-foreground-muted">
          {localizedAuthor(article.author, locale)} ·{" "}
          {localizedPublishedAt(article.publishedAt, locale)}
        </p>
      </div>
    </Link>
  );
}
