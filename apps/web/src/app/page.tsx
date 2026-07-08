import { HeroStory } from "@/components/home/HeroStory";
import { TopStoriesList } from "@/components/home/TopStoriesList";
import { LatestHeadlines } from "@/components/home/LatestHeadlines";
import { NewsSection } from "@/components/home/NewsSection";
import { GalleryStrip } from "@/components/home/GalleryStrip";
import { ReadingSidebar } from "@/components/home/ReadingSidebar";
import {
  heroArticle,
  nationalArticles,
  politicsArticles,
  specialReportArticles,
  nationwideArticles,
  sportsArticles,
  entertainmentArticles,
  jobsArticles,
  featuresArticles,
  technologyArticles,
  opinionArticles,
  religionArticles,
  crimeArticles,
  environmentArticles,
  videoArticles,
  galleryArticles,
  trendingArticles,
  latestReadArticles,
  getLatestHeadlines,
} from "@/lib/mock-data";

const topStories = [
  politicsArticles[1],
  sportsArticles[1],
  entertainmentArticles[1],
  specialReportArticles[0],
  nationwideArticles[0],
].filter(Boolean);

export default function Home() {
  return (
    <main className="mx-auto grid w-full max-w-[1600px] flex-1 gap-8 px-6 py-6 lg:grid-cols-[1fr_300px]">
      <div className="flex flex-col gap-8">
        <div className="grid gap-6 md:grid-cols-[1.6fr_1fr]">
          <HeroStory article={heroArticle} />
          <div className="rounded-lg border border-border bg-surface px-5">
            <TopStoriesList articles={topStories} />
          </div>
        </div>

        <LatestHeadlines articles={getLatestHeadlines()} />

        <NewsSection title="জাতীয়" href="/national" articles={nationalArticles} />
        <NewsSection title="রাজনীতি" href="/politics" articles={politicsArticles} />
        <NewsSection
          title="বিশেষ প্রতিবেদন"
          href="/special-report"
          articles={specialReportArticles}
        />
        <GalleryStrip articles={galleryArticles} />
        <NewsSection title="দেশজুড়ে" href="/nationwide" articles={nationwideArticles} />
        <NewsSection title="খেলাধুলা" href="/sports" articles={sportsArticles} />
        <NewsSection title="ভিডিও নিউজ" href="/video" articles={videoArticles} />
        <NewsSection
          title="বিনোদন"
          href="/entertainment"
          articles={entertainmentArticles}
        />
        <NewsSection title="প্রযুক্তি" href="/technology" articles={technologyArticles} />
        <NewsSection title="চাকরি" href="/jobs" articles={jobsArticles} />
        <NewsSection title="মতামত" href="/opinion" articles={opinionArticles} />
        <NewsSection title="ধর্ম" href="/religion" articles={religionArticles} />
        <NewsSection title="আইন-আদালত" href="/crime" articles={crimeArticles} />
        <NewsSection title="পরিবেশ" href="/environment" articles={environmentArticles} />
        <NewsSection title="ফিচার" href="/features" articles={featuresArticles} />
      </div>

      <div className="hidden lg:block">
        <ReadingSidebar mostRead={trendingArticles} latestRead={latestReadArticles} />
      </div>
    </main>
  );
}
