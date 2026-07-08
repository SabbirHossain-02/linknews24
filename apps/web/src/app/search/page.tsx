import type { Metadata } from "next";
import { SearchResultsView } from "@/components/home/SearchResultsView";
import { ReadingSidebar } from "@/components/home/ReadingSidebar";
import {
  searchArticles,
  trendingArticles,
  latestReadArticles,
} from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Search",
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
      <SearchResultsView query={query} results={results} />

      <div className="hidden lg:block">
        <ReadingSidebar mostRead={trendingArticles} latestRead={latestReadArticles} />
      </div>
    </main>
  );
}
