import Link from "next/link";
import type { Article } from "@/types/content";
import { toneGradientClass } from "@/lib/tone";
import { getArticleBody, getRelatedArticles } from "@/lib/mock-data";
import { ThematicRow } from "@/components/home/ThematicRow";
import { ShareButtons } from "./ShareButtons";
import { ArticleSchema } from "./ArticleSchema";

export function ArticleContent({ article }: { article: Article }) {
  const body = getArticleBody(article);
  const related = getRelatedArticles(article);

  return (
    <article className="flex flex-col gap-8">
      <ArticleSchema article={article} />

      <div className="flex flex-col gap-4">
        <nav aria-label="ব্রেডক্রাম্ব" className="font-ui text-xs text-foreground-muted">
          <Link href="/" className="hover:text-brand-crimson">
            হোম
          </Link>
          <span className="mx-1.5">/</span>
          <Link
            href={`/${article.category.slug}`}
            className="hover:text-brand-crimson"
          >
            {article.category.name}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {article.isBreaking && (
            <span className="rounded bg-brand-crimson px-2 py-0.5 font-ui text-[11px] font-bold uppercase tracking-wide text-white">
              ব্রেকিং
            </span>
          )}
          <Link
            href={`/${article.category.slug}`}
            className="font-ui text-xs font-semibold uppercase tracking-wide text-brand-crimson hover:underline"
          >
            {article.category.name}
          </Link>
        </div>

        <h1 className="text-2xl font-bold leading-tight text-heading sm:text-3xl md:text-4xl">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center justify-between gap-4 border-y border-border py-3">
          <p className="font-ui text-sm text-foreground-muted">
            <span className="font-semibold text-foreground">{article.author}</span>
            <span className="mx-1.5">·</span>
            {article.publishedAt}
          </p>
          <ShareButtons title={article.title} />
        </div>
      </div>

      <div
        className={`aspect-video w-full overflow-hidden rounded-lg ${toneGradientClass(
          article.imageTone,
        )}`}
      />

      <div className="flex max-w-2xl flex-col gap-5">
        {body.map((paragraph, index) => (
          <p key={index} className="text-[17px] leading-relaxed text-foreground">
            {paragraph}
          </p>
        ))}
      </div>

      {related.length > 0 && (
        <div className="border-t border-border pt-8">
          <ThematicRow
            title="সম্পর্কিত সংবাদ"
            href={`/${article.category.slug}`}
            articles={related}
          />
        </div>
      )}
    </article>
  );
}
