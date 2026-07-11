import type { Metadata } from "next";
import { SearchResultsView } from "@/components/home/SearchResultsView";
import { ReadingSidebar } from "@/components/home/ReadingSidebar";
import { getArticles, getCategories, getSidebar, toArticle } from "@/lib/api";

export const metadata: Metadata = {
  title: "Search",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; from?: string; to?: string }>;
}) {
  const { q, category, from, to } = await searchParams;
  const query = q?.trim() ?? "";
  const hasFilter = Boolean(query || category || from || to);

  const [{ articles }, categories, sidebar] = await Promise.all([
    hasFilter
      ? getArticles({ q: query, category, from, to, limit: 48 })
      : Promise.resolve({ articles: [], total: 0 }),
    getCategories(),
    getSidebar(),
  ]);

  const results = articles.map(toArticle);

  return (
    <main className="mx-auto grid w-full max-w-[1600px] flex-1 gap-10 px-6 py-8 lg:grid-cols-[1fr_300px]">
      <SearchResultsView
        query={query}
        results={results}
        categories={categories}
        selectedCategory={category ?? ""}
        from={from ?? ""}
        to={to ?? ""}
        active={hasFilter}
      />

      <div className="hidden lg:block">
        <ReadingSidebar mostRead={sidebar.mostRead} latestRead={sidebar.latest} />
      </div>
    </main>
  );
}
