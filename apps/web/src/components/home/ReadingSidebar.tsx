import { Clock, Flame } from "lucide-react";
import type { Article } from "@/types/content";
import { RankedArticleList } from "./RankedArticleList";

export function ReadingSidebar({
  mostRead,
  latestRead,
}: {
  mostRead: Article[];
  latestRead: Article[];
}) {
  return (
    <aside className="sticky top-[190px] overflow-hidden rounded-xl border border-border bg-background shadow-[0_1px_2px_rgba(20,24,31,0.04),0_8px_24px_rgba(20,24,31,0.06)]">
      <div className="h-1 bg-gradient-to-r from-brand-crimson to-brand-crimson-dark" />
      <div className="flex flex-col divide-y divide-border p-5">
        <div className="pb-6">
          <RankedArticleList
            title="সবচেয়ে পঠিত"
            icon={Flame}
            articles={mostRead}
            showViewCount
          />
        </div>
        <div className="pt-6">
          <RankedArticleList title="সর্বশেষ পঠিত" icon={Clock} articles={latestRead} />
        </div>
      </div>
    </aside>
  );
}
