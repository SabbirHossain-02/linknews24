import { HeroStory } from "@/components/home/HeroStory";
import { ThematicRow } from "@/components/home/ThematicRow";
import { GalleryStrip } from "@/components/home/GalleryStrip";
import { TrendingTagsBar } from "@/components/home/TrendingTagsBar";
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
  videoArticles,
  galleryArticles,
  trendingArticles,
  latestReadArticles,
} from "@/lib/mock-data";

export default function Home() {
  return (
    <>
      <TrendingTagsBar />

      <main className="mx-auto grid w-full max-w-6xl flex-1 gap-10 px-6 py-8 lg:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-12">
          <HeroStory article={heroArticle} />
          <ThematicRow title="জাতীয়" href="/national" articles={nationalArticles} />
          <ThematicRow title="রাজনীতি" href="/politics" articles={politicsArticles} />
          <ThematicRow
            title="বিশেষ প্রতিবেদন"
            href="/special-report"
            articles={specialReportArticles}
          />
          <GalleryStrip articles={galleryArticles} />
          <ThematicRow title="দেশজুড়ে" href="/nationwide" articles={nationwideArticles} />
          <ThematicRow title="খেলাধুলা" href="/sports" articles={sportsArticles} />
          <ThematicRow title="ভিডিও নিউজ" href="/video" articles={videoArticles} />
          <ThematicRow
            title="বিনোদন"
            href="/entertainment"
            articles={entertainmentArticles}
          />
          <ThematicRow title="চাকরি" href="/jobs" articles={jobsArticles} />
          <ThematicRow title="ফিচার" href="/features" articles={featuresArticles} />
        </div>

        <div className="hidden lg:block">
          <ReadingSidebar mostRead={trendingArticles} latestRead={latestReadArticles} />
        </div>
      </main>
    </>
  );
}
