import { HeroStory } from "@/components/home/HeroStory";
import { TopStoriesList } from "@/components/home/TopStoriesList";
import { LatestHeadlines } from "@/components/home/LatestHeadlines";
import { NewsSection } from "@/components/home/NewsSection";
import { ReadingSidebar } from "@/components/home/ReadingSidebar";
import { getArticles, getCategories, getSidebar, toArticle } from "@/lib/api";
import type { Article } from "@/types/content";

export default async function Home() {
  const [{ articles: raw }, cats, sidebar] = await Promise.all([
    getArticles({ limit: 80 }),
    getCategories(),
    getSidebar(),
  ]);

  const mapped = raw.map(toArticle);

  if (mapped.length === 0) {
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

  const heroIdx = raw.findIndex((a) => a.featured);
  const hero = toArticle(raw[heroIdx >= 0 ? heroIdx : 0]);
  const rest = mapped.filter((a) => a.slug !== hero.slug);
  const topStories = rest.slice(0, 5);
  const latest = rest.slice(0, 10);

  const byCat = new Map<string, Article[]>();
  for (const a of mapped) {
    const arr = byCat.get(a.category.slug) ?? [];
    arr.push(a);
    byCat.set(a.category.slug, arr);
  }
  const sections = cats
    .map((c) => ({ c, items: byCat.get(c.slug) ?? [] }))
    .filter((s) => s.items.length >= 2)
    .slice(0, 12);

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

        {sections.map(({ c, items }) => (
          <NewsSection
            key={c.slug}
            title={c.name}
            titleEn={c.nameEn}
            href={`/${c.slug}`}
            articles={items}
          />
        ))}
      </div>

      <div className="hidden lg:block">
        <ReadingSidebar mostRead={sidebar.mostRead} latestRead={sidebar.latest} />
      </div>
    </main>
  );
}
