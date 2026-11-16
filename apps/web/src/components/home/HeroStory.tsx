"use client";

import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/types/content";
import { toneGradientClass } from "@/lib/tone";
import { localizedAuthor, localizedName } from "@/lib/i18n";
import { useLocale } from "@/components/providers/LocaleProvider";
import { TimeAgo } from "./TimeAgo";

export function HeroStory({ article }: { article: Article }) {
  const { locale, t } = useLocale();

  /*
   * The picture used to be a fixed 16:8 box with the text laid over it. On a
   * tablet the hero shares the row with the top-stories list, so the box was
   * narrow and short while the text was sized for the whole screen — a long
   * headline plus its excerpt overflowed the top and was cut off.
   *
   * Now the 16:8 box is only a minimum: the spacer and the text share one
   * grid cell, so the cell is as tall as whichever is taller and the picture
   * fills it. And the text is sized by the hero's own width (container
   * queries), not the screen's.
   */
  return (
    <Link href={`/${article.slug}`} className="group block">
      <div
        // grid-cols-1 is minmax(0, 1fr): an implicit `auto` column grew to the
        // text's width and pushed the headline past the edge on phones.
        className={`@container relative grid w-full grid-cols-1 overflow-hidden rounded-lg ${toneGradientClass(
          article.imageTone,
        )}`}
      >
        {article.featuredImage && (
          <Image
            src={article.featuredImage}
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/5" />
        <div aria-hidden className="col-start-1 row-start-1 aspect-[16/8]" />
        <div className="relative col-start-1 row-start-1 min-w-0 self-end p-4 @md:p-6 @3xl:p-8">
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
          <h1 className="mt-2 max-w-2xl text-xl font-bold leading-snug text-white transition-colors group-hover:text-white/90 @md:mt-3 @md:text-2xl @2xl:text-3xl @4xl:text-4xl @4xl:leading-tight">
            {locale === "en" ? article.titleEn : article.title}
          </h1>
          <p className="mt-2 line-clamp-2 max-w-xl font-ui text-sm text-white/75 @md:mt-3 @3xl:text-base">
            {locale === "en" ? article.excerptEn : article.excerpt}
          </p>
          <p className="mt-2 font-ui text-xs text-white/60 @md:mt-3">
            {localizedAuthor(article.author, locale)} · <TimeAgo iso={article.publishedAt} />
          </p>
        </div>
      </div>
    </Link>
  );
}
