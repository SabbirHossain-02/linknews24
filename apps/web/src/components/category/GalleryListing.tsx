import Link from "next/link";
import { Pagination } from "@/components/home/Pagination";
import { toneGradientClass } from "@/lib/tone";
import type { Article, Category } from "@/types/content";

export function GalleryListing({
  category,
  items,
  currentPage,
  totalPages,
}: {
  category: Category;
  items: Article[];
  currentPage: number;
  totalPages: number;
}) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="border-b-2 border-brand-navy pb-2 text-2xl font-bold text-brand-navy">
        {category.name}
      </h1>

      {items.length === 0 ? (
        <p className="py-12 text-center font-ui text-sm text-foreground-muted">
          এই মুহূর্তে কোনো ছবির গ্যালারি নেই।
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {items.map((article) => (
              <Link key={article.id} href={`/${article.slug}`} className="group block">
                <div
                  className={`relative aspect-square w-full overflow-hidden rounded-md ${toneGradientClass(
                    article.imageTone,
                  )}`}
                >
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                </div>
                <h3 className="mt-2 text-sm font-medium leading-snug text-foreground transition-colors group-hover:text-brand-crimson">
                  {article.title}
                </h3>
                <p className="mt-1 font-ui text-xs text-foreground-muted">
                  {article.author} · {article.publishedAt}
                </p>
              </Link>
            ))}
          </div>
          <Pagination
            basePath={`/${category.slug}`}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </>
      )}
    </div>
  );
}
