import { ArticleCard } from "@/components/home/ArticleCard";
import { Pagination } from "@/components/home/Pagination";
import type { Article, Category } from "@/types/content";

export function CategoryListing({
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
          এই মুহূর্তে {category.name} বিভাগে কোনো সংবাদ নেই।
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
            {items.map((article) => (
              <ArticleCard key={article.id} article={article} />
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
