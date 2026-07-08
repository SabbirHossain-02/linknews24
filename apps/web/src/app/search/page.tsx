import type { Metadata } from "next";
import { ArticleCard } from "@/components/home/ArticleCard";
import { SearchForm } from "@/components/home/SearchForm";
import { ReadingSidebar } from "@/components/home/ReadingSidebar";
import {
  searchArticles,
  trendingArticles,
  latestReadArticles,
} from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "সার্চ",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const results = query ? searchArticles(query) : [];

  return (
    <main className="mx-auto grid w-full max-w-[1600px] flex-1 gap-10 px-6 py-8 lg:grid-cols-[1fr_300px]">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-brand-navy">সার্চ</h1>
        <SearchForm defaultValue={query} />

        {query && (
          <p className="font-ui text-sm text-foreground-muted">
            <span className="font-semibold text-foreground">&quot;{query}&quot;</span>
            {" "}এর জন্য {results.length} টি ফলাফল পাওয়া গেছে
          </p>
        )}

        {query && results.length === 0 && (
          <p className="py-12 text-center font-ui text-sm text-foreground-muted">
            কোনো সংবাদ পাওয়া যায়নি। ভিন্ন কীওয়ার্ড দিয়ে আবার চেষ্টা করুন।
          </p>
        )}

        {results.length > 0 && (
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
            {results.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>

      <div className="hidden lg:block">
        <ReadingSidebar mostRead={trendingArticles} latestRead={latestReadArticles} />
      </div>
    </main>
  );
}
