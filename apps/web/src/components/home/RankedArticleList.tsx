import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import type { Article } from "@/types/content";

export function RankedArticleList({
  title,
  icon: Icon,
  articles,
  showViewCount = false,
}: {
  title: string;
  icon: LucideIcon;
  articles: Article[];
  showViewCount?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-crimson/10 text-brand-crimson">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="text-[15px] font-bold tracking-tight text-brand-navy">
          {title}
        </h2>
      </div>

      <ol className="mt-4 flex flex-col divide-y divide-border">
        {articles.map((article, index) => (
          <li key={article.id} className="py-3.5 first:pt-0 last:pb-0">
            <Link
              href={`/${article.category.slug}/${article.slug}`}
              className="group flex items-start gap-3.5"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-ui text-[11px] font-bold transition-colors ${
                  index === 0
                    ? "bg-brand-crimson text-white"
                    : "bg-brand-navy/[0.06] text-brand-navy/50 group-hover:bg-brand-crimson/10 group-hover:text-brand-crimson"
                }`}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <h3 className="text-[13.5px] font-semibold leading-snug text-foreground transition-colors group-hover:text-brand-crimson">
                  {article.title}
                </h3>
                {showViewCount && article.viewCount != null && (
                  <p className="mt-1.5 font-ui text-[11px] text-foreground-muted">
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
