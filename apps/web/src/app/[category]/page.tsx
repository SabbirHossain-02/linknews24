import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/home/ArticleCard";
import { Pagination } from "@/components/home/Pagination";
import { TrendingSidebar } from "@/components/home/TrendingSidebar";
import {
  categories,
  getArticlesByCategory,
  paginate,
  trendingArticles,
} from "@/lib/mock-data";

type PageParams = { category: string };
type PageSearchParams = { page?: string };

export function generateStaticParams() {
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = categories.find((c) => c.slug === slug);
  if (!category) return {};

  return {
    title: category.name,
    description: `LinkNews24-এ সর্বশেষ ${category.name} বিভাগের সংবাদ।`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<PageSearchParams>;
}) {
  const { category: slug } = await params;
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const { page } = await searchParams;
  const requestedPage = Number(page) || 1;

  const { items, totalPages, currentPage } = paginate(
    getArticlesByCategory(slug),
    requestedPage,
  );

  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 gap-10 px-6 py-8 lg:grid-cols-[1fr_300px]">
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
              basePath={`/${slug}`}
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </>
        )}
      </div>

      <div className="hidden lg:block">
        <TrendingSidebar articles={trendingArticles} />
      </div>
    </main>
  );
}
