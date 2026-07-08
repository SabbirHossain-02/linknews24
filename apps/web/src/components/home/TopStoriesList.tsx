import Link from "next/link";
import type { Article } from "@/types/content";

export function TopStoriesList({ articles }: { articles: Article[] }) {
  return (
    <div className="flex h-full flex-col">
      <h2 className="border-b-2 border-heading pb-2 text-lg font-bold text-heading">
        আরও শীর্ষ খবর
      </h2>
      <ul className="flex flex-1 flex-col divide-y divide-border">
        {articles.map((article) => (
          <li key={article.id} className="py-3 first:pt-3 last:pb-0">
            <Link href={`/${article.slug}`} className="group block">
              <span className="font-ui text-xs font-semibold uppercase tracking-wide text-brand-crimson">
                {article.category.name}
              </span>
              <h3 className="mt-1 text-[15px] font-semibold leading-snug text-foreground transition-colors group-hover:text-brand-crimson">
                {article.title}
              </h3>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
