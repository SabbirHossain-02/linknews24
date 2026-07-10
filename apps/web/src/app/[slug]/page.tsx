import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Article, Category } from "@/types/content";
import { CategoryListing } from "@/components/category/CategoryListing";
import { GalleryListing } from "@/components/category/GalleryListing";
import { ArticleContent } from "@/components/article/ArticleContent";
import { ReadingSidebar } from "@/components/home/ReadingSidebar";
import {
  getArticleBySlug,
  getArticles,
  getCategories,
  getSidebar,
  toArticle,
} from "@/lib/api";

const PER_PAGE = 12;

type PageParams = { slug: string };
type PageSearchParams = { page?: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;

  const article = await getArticleBySlug(slug);
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

  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);
  if (category) {
    return {
      title: category.name,
      description: `LinkNews24-এ সর্বশেষ ${category.name} বিভাগের সংবাদ।`,
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

  // 1) Article?
  const apiArticle = await getArticleBySlug(slug);
  if (apiArticle) {
    const article = toArticle(apiArticle);
    const { articles: relatedRaw } = await getArticles({
      category: article.category.slug,
      limit: 5,
    });
    const related = relatedRaw
      .map(toArticle)
      .filter((a) => a.slug !== article.slug)
      .slice(0, 4);
    const sidebar = await getSidebar();

    return (
      <main className="mx-auto grid w-full max-w-[1600px] flex-1 gap-10 px-6 py-8 lg:grid-cols-[1fr_300px]">
        <ArticleContent
          article={article}
          bodyHtmlBn={apiArticle.body ?? ""}
          bodyHtmlEn={apiArticle.bodyEn ?? ""}
          related={related}
        />
        <div className="hidden lg:block print:hidden">
          <ReadingSidebar mostRead={sidebar.mostRead} latestRead={sidebar.latest} />
        </div>
      </main>
    );
  }

  // 2) Category?
  const categories = await getCategories();
  const apiCategory = categories.find((c) => c.slug === slug);
  if (apiCategory) {
    const { page } = await searchParams;
    const currentPage = Math.max(Number(page) || 1, 1);
    const { articles, total } = await getArticles({
      category: slug,
      limit: PER_PAGE,
      page: currentPage,
    });
    const totalPages = Math.max(Math.ceil(total / PER_PAGE), 1);

    const category: Category = {
      id: apiCategory.id,
      name: apiCategory.name,
      nameEn: apiCategory.nameEn,
      slug: apiCategory.slug,
    };
    const items: Article[] = articles.map(toArticle);
    const sidebar = await getSidebar();
    const Listing = slug === "gallery" ? GalleryListing : CategoryListing;

    return (
      <main className="mx-auto grid w-full max-w-[1600px] flex-1 gap-10 px-6 py-8 lg:grid-cols-[1fr_300px]">
        <Listing
          category={category}
          items={items}
          currentPage={currentPage}
          totalPages={totalPages}
        />
        <div className="hidden lg:block">
          <ReadingSidebar mostRead={sidebar.mostRead} latestRead={sidebar.latest} />
        </div>
      </main>
    );
  }

  notFound();
}
