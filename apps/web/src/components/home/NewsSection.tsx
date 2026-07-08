"use client";

import Link from "next/link";
import { Play } from "lucide-react";
import type { Article } from "@/types/content";
import { toneGradientClass } from "@/lib/tone";
import { localizedAuthor, localizedName, localizedPublishedAt } from "@/lib/i18n";
import { useLocale } from "@/components/providers/LocaleProvider";

export function NewsSection({
  title,
  href,
  articles,
}: {
  title: string;
  href: string;
  articles: Article[];
}) {
  const { locale, t } = useLocale();
  const [lead, ...rest] = articles;
  if (!lead) return null;
  const listItems = rest.slice(0, 5);

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

      <div className="mt-4 grid gap-x-8 gap-y-5 md:grid-cols-[1.3fr_1fr]">
        <Link href={`/${lead.slug}`} className="group block">
          <div
            className={`relative aspect-video w-full overflow-hidden rounded-md ${toneGradientClass(
              lead.imageTone,
            )}`}
          >
            {lead.isVideo && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 transition-transform group-hover:scale-110">
                  <Play className="h-4 w-4 fill-brand-navy text-brand-navy" />
                </div>
              </div>
            )}
          </div>
          <div className="mt-2.5">
            <span className="font-ui text-xs font-semibold uppercase tracking-wide text-brand-crimson">
              {localizedName(lead.category, locale)}
            </span>
            <h3 className="mt-1 text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-brand-crimson">
              {locale === "en" ? lead.titleEn : lead.title}
            </h3>
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

        <ul className="flex flex-col divide-y divide-border">
          {listItems.map((article) => (
            <li key={article.id} className="py-3 first:pt-0 last:pb-0">
              <Link href={`/${article.slug}`} className="group flex gap-3">
                <div
                  className={`h-16 w-24 shrink-0 overflow-hidden rounded ${toneGradientClass(
                    article.imageTone,
                  )}`}
                />
                <div className="min-w-0">
                  <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-brand-crimson">
                    {locale === "en" ? article.titleEn : article.title}
                  </h4>
                  <p className="mt-1 font-ui text-xs text-foreground-muted">
                    {localizedPublishedAt(article.publishedAt, locale)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
