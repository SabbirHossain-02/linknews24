import Link from "next/link";
import type { Article } from "@/types/content";

export function TrendingSidebar({ articles }: { articles: Article[] }) {
  return (
    <aside className="sticky top-[190px] rounded-lg border border-border bg-surface p-5">
      <h2 className="border-b-2 border-brand-navy pb-2 text-lg font-bold text-brand-navy">
        Trending
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
                <p className="mt-1 font-ui text-xs text-foreground-muted">
                  {article.viewCount?.toLocaleString("bn-BD")} বার পঠিত
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </aside>
  );
}
