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
    <aside className="sticky top-[190px] flex flex-col gap-8 rounded-lg border border-border bg-surface p-5">
      <RankedArticleList title="সবচেয়ে পঠিত" articles={mostRead} showViewCount />
      <RankedArticleList title="সর্বশেষ পঠিত" articles={latestRead} />
    </aside>
  );
}
