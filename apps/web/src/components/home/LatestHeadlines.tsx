import Link from "next/link";
import type { Article } from "@/types/content";

export function LatestHeadlines({ articles }: { articles: Article[] }) {
  return (
    <section>
      <div className="flex items-center gap-2 border-b-2 border-heading pb-2">
        <span className="h-2 w-2 rounded-full bg-brand-crimson" />
        <h2 className="text-lg font-bold text-heading">সর্বশেষ</h2>
      </div>
      <ul className="mt-1 grid sm:grid-cols-2 sm:gap-x-10">
        {articles.map((article) => (
          <li key={article.id} className="border-b border-border last:border-b-0 sm:last:border-b sm:[&:nth-last-child(-n+2)]:border-b-0">
            <Link
              href={`/${article.slug}`}
              className="group flex items-baseline justify-between gap-4 py-2.5"
            >
              <span className="line-clamp-1 text-[15px] font-medium leading-snug text-foreground transition-colors group-hover:text-brand-crimson">
                {article.title}
              </span>
              <span className="shrink-0 font-ui text-xs text-foreground-muted">
                {article.publishedAt}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
