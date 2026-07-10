import { HeroStory } from "@/components/home/HeroStory";
import { TopStoriesList } from "@/components/home/TopStoriesList";
import { LatestHeadlines } from "@/components/home/LatestHeadlines";
import { NewsSection } from "@/components/home/NewsSection";
import { ReadingSidebar } from "@/components/home/ReadingSidebar";
import { getHomepage, getSidebar, toArticle } from "@/lib/api";

export default async function Home() {
  const [
    { hero: heroRaw, topStories: topRaw, latest: latestRaw, sections },
    sidebar,
  ] = await Promise.all([getHomepage(), getSidebar()]);

  if (!heroRaw) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-3 px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-heading">
          এখনো কোনো সংবাদ প্রকাশিত হয়নি
        </h1>
        <p className="font-ui text-sm text-foreground-muted">
          অ্যাডমিন প্যানেল থেকে আর্টিকেল প্রকাশ করলে এখানে দেখা যাবে।
        </p>
      </main>
    );
  }

  const hero = toArticle(heroRaw);
  const latestMapped = latestRaw
    .map(toArticle)
    .filter((a) => a.slug !== hero.slug);
  const topStories = (topRaw.length ? topRaw.map(toArticle) : latestMapped).slice(
    0,
    5,
  );
  const latest = latestMapped.slice(0, 10);

  return (
    <main className="mx-auto grid w-full max-w-[1600px] flex-1 gap-8 px-6 py-6 lg:grid-cols-[1fr_300px]">
      <div className="flex flex-col gap-8">
        <div className="grid gap-6 md:grid-cols-[1.6fr_1fr]">
          <HeroStory article={hero} />
          <div className="rounded-lg border border-border bg-surface px-5">
            <TopStoriesList articles={topStories} />
          </div>
        </div>

        <LatestHeadlines articles={latest} />

        {sections.map((s) => (
          <NewsSection
            key={s.category.slug}
            title={s.category.name}
            titleEn={s.category.nameEn}
            href={`/${s.category.slug}`}
            articles={s.articles.map(toArticle)}
          />
        ))}
      </div>

      <div className="hidden lg:block">
        <ReadingSidebar mostRead={sidebar.mostRead} latestRead={sidebar.latest} />
      </div>
    </main>
  );
}
