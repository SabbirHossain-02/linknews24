"use client";

import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/types/content";
import { toneGradientClass } from "@/lib/tone";
import { getArticleBody, getRelatedArticles } from "@/lib/mock-data";
import { localizedAuthor, localizedName } from "@/lib/i18n";
import { useLocale } from "@/components/providers/LocaleProvider";
import { TimeAgo } from "@/components/home/TimeAgo";
import { ThematicRow } from "@/components/home/ThematicRow";
import { ArticleActions } from "./ArticleActions";
import { RecordHistory } from "./RecordHistory";
import { ArticleSchema } from "./ArticleSchema";
import { CommentSection } from "./CommentSection";

export function ArticleContent({
  article,
  bodyHtmlBn,
  bodyHtmlEn,
  related: relatedProp,
  tags = [],
}: {
  article: Article;
  bodyHtmlBn?: string;
  bodyHtmlEn?: string;
  related?: Article[];
  tags?: { name: string; nameEn: string; slug: string }[];
}) {
  const { locale, t } = useLocale();
  const hasHtml = bodyHtmlBn !== undefined || bodyHtmlEn !== undefined;
  const body = hasHtml ? [] : getArticleBody(article, locale);
  const bodyHtml = locale === "en" ? bodyHtmlEn ?? "" : bodyHtmlBn ?? "";
  const related = relatedProp ?? getRelatedArticles(article);
  const categoryLabel = localizedName(article.category, locale);
  const title = locale === "en" ? article.titleEn : article.title;

  return (
    <article className="flex flex-col gap-8">
      <ArticleSchema article={article} />
      <RecordHistory article={article} />

      <div className="flex flex-col gap-4">
        <nav aria-label="Breadcrumb" className="font-ui text-xs text-foreground-muted">
          <Link href="/" className="hover:text-brand-crimson">
            {t("home")}
          </Link>
          <span className="mx-1.5">/</span>
          <Link
            href={`/${article.category.slug}`}
            className="hover:text-brand-crimson"
          >
            {categoryLabel}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {article.isBreaking && (
            <span className="rounded bg-brand-crimson px-2 py-0.5 font-ui text-[11px] font-bold uppercase tracking-wide text-white">
              {t("breaking")}
            </span>
          )}
          <Link
            href={`/${article.category.slug}`}
            className="font-ui text-xs font-semibold uppercase tracking-wide text-brand-crimson hover:underline"
          >
            {categoryLabel}
          </Link>
        </div>

        <h1 className="text-2xl font-bold leading-tight text-heading sm:text-3xl md:text-4xl">
          {title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border py-3">
          <p className="font-ui text-sm text-foreground-muted">
            <span className="font-semibold text-foreground">
              {localizedAuthor(article.author, locale)}
            </span>
            <span className="mx-1.5">·</span>
            <TimeAgo iso={article.publishedAt} />
          </p>
          <ArticleActions article={article} title={title} />
        </div>
      </div>

      {article.featuredImage ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src={article.featuredImage}
            alt={title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover"
          />
        </div>
      ) : (
        <div
          className={`aspect-video w-full overflow-hidden rounded-lg ${toneGradientClass(
            article.imageTone,
          )}`}
        />
      )}

      {hasHtml ? (
        <div
          className="ln-editor max-w-2xl text-[17px] leading-relaxed text-foreground"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      ) : (
        <div className="flex max-w-2xl flex-col gap-5">
          {body.map((paragraph, index) => (
            <p key={index} className="text-[17px] leading-relaxed text-foreground">
              {paragraph}
            </p>
          ))}
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-6">
          {tags.map((tag) => (
            <Link
              key={tag.slug}
              href={`/tag/${tag.slug}`}
              className="rounded-full border border-border bg-surface px-3 py-1 font-ui text-xs font-medium text-foreground-muted transition-colors hover:border-brand-crimson hover:text-brand-crimson"
            >
              #{locale === "en" ? tag.nameEn : tag.name}
            </Link>
          ))}
        </div>
      )}

      <CommentSection slug={article.slug} />

      {related.length > 0 && (
        <div className="border-t border-border pt-8">
          <ThematicRow
            title={t("relatedNews")}
            href={`/${article.category.slug}`}
            articles={related}
          />
        </div>
      )}
    </article>
  );
}
