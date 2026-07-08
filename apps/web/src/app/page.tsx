import { HeroStory } from "@/components/home/HeroStory";
import { ThematicRow } from "@/components/home/ThematicRow";
import { GalleryStrip } from "@/components/home/GalleryStrip";
import { TrendingSidebar } from "@/components/home/TrendingSidebar";
import {
  heroArticle,
  nationalArticles,
  politicsArticles,
  sportsArticles,
  entertainmentArticles,
  videoArticles,
  galleryArticles,
  trendingArticles,
} from "@/lib/mock-data";

export default function Home() {
  return (
    <main className="mx-auto grid w-full max-w-6xl flex-1 gap-10 px-6 py-8 lg:grid-cols-[1fr_300px]">
      <div className="flex flex-col gap-12">
        <HeroStory article={heroArticle} />
        <ThematicRow title="জাতীয়" href="/national" articles={nationalArticles} />
        <ThematicRow title="রাজনীতি" href="/politics" articles={politicsArticles} />
        <ThematicRow title="খেলা" href="/sports" articles={sportsArticles} />
        <ThematicRow title="ভিডিও নিউজ" href="/video" articles={videoArticles} />
        <ThematicRow
          title="বিনোদন"
          href="/entertainment"
          articles={entertainmentArticles}
        />
        <GalleryStrip articles={galleryArticles} />
      </div>

      <div className="hidden lg:block">
        <TrendingSidebar articles={trendingArticles} />
      </div>
    </main>
  );
}
