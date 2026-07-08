import Link from "next/link";
import type { Article } from "@/types/content";

export function RankedArticleList({
  title,
  articles,
  showViewCount = false,
}: {
  title: string;
  articles: Article[];
  showViewCount?: boolean;
}) {
  return (
    <div>
      <h2 className="border-b-2 border-brand-navy pb-2 text-lg font-bold text-brand-navy">
        {title}
      </h2>
      <ol className="mt-4 flex flex-col gap-4">
        {articles.map((article, index) => (
          <li key={article.id}>
            <Link
              href={`/${article.category.slug}/${article.slug}`}
              className="group flex gap-3"
            >
              <span className="font-ui text-2xl font-bold text-border">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-brand-crimson">
                  {article.title}
                </h3>
                {showViewCount && article.viewCount != null && (
                  <p className="mt-1 font-ui text-xs text-foreground-muted">
                    {article.viewCount.toLocaleString("bn-BD")} বার পঠিত
                  </p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
