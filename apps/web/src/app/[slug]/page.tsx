import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryListing } from "@/components/category/CategoryListing";
import { GalleryListing } from "@/components/category/GalleryListing";
import { ArticleContent } from "@/components/article/ArticleContent";
import { ReadingSidebar } from "@/components/home/ReadingSidebar";
import {
  categories,
  allArticles,
  getArticleBySlug,
  getArticlesByCategory,
  paginate,
  trendingArticles,
  latestReadArticles,
} from "@/lib/mock-data";

type PageParams = { slug: string };
type PageSearchParams = { page?: string };

export function generateStaticParams() {
  return [
    ...categories.map((category) => ({ slug: category.slug })),
    ...allArticles.map((article) => ({ slug: article.slug })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;

  const category = categories.find((c) => c.slug === slug);
  if (category) {
    return {
      title: category.name,
      description: `LinkNews24-এ সর্বশেষ ${category.name} বিভাগের সংবাদ।`,
    };
  }

  const article = getArticleBySlug(slug);
  if (article) {
    return {
      title: article.title,
      description: article.excerpt,
      openGraph: {
        title: article.title,
        description: article.excerpt,
        type: "article",
      },
    };
  }

  return {};
}

export default async function SlugPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<PageSearchParams>;
}) {
  const { slug } = await params;

  const category = categories.find((c) => c.slug === slug);
  if (category) {
    const { page } = await searchParams;
    const requestedPage = Number(page) || 1;
    const { items, totalPages, currentPage } = paginate(
      getArticlesByCategory(slug),
      requestedPage,
    );

    const Listing = category.slug === "gallery" ? GalleryListing : CategoryListing;

    return (
      <main className="mx-auto grid w-full max-w-[1600px] flex-1 gap-10 px-6 py-8 lg:grid-cols-[1fr_300px]">
        <Listing
          category={category}
          items={items}
          currentPage={currentPage}
          totalPages={totalPages}
        />
        <div className="hidden lg:block print:hidden">
          <ReadingSidebar mostRead={trendingArticles} latestRead={latestReadArticles} />
        </div>
      </main>
    );
  }

  const article = getArticleBySlug(slug);
  if (article) {
    return (
      <main className="mx-auto grid w-full max-w-[1600px] flex-1 gap-10 px-6 py-8 lg:grid-cols-[1fr_300px]">
        <ArticleContent article={article} />
        <div className="hidden lg:block print:hidden">
          <ReadingSidebar mostRead={trendingArticles} latestRead={latestReadArticles} />
        </div>
      </main>
    );
  }

  notFound();
}
