"use client";

import { Clock, Flame } from "lucide-react";
import type { Article } from "@/types/content";
import { RankedArticleList } from "./RankedArticleList";
import { LiveTV } from "./LiveTV";
import { AdSlot } from "@/components/ads/AdSlot";

export function ReadingSidebar({
  mostRead,
  latestRead,
}: {
  mostRead: Article[];
  latestRead: Article[];
}) {
  return (
    <div className="sticky top-[190px] flex max-h-[calc(100vh-190px-2rem)] flex-col gap-4">
      <LiveTV />
      <AdSlot placement="SIDEBAR" className="rounded-xl border border-border" />
      <aside className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-background shadow-[0_1px_2px_rgba(20,24,31,0.04),0_8px_24px_rgba(20,24,31,0.06)]">
        <div className="h-1 shrink-0 bg-gradient-to-r from-brand-crimson to-brand-crimson-dark" />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col divide-y divide-border p-5">
            <div className="pb-6">
              <RankedArticleList
                title="Most Read"
                icon={Flame}
                articles={mostRead}
                showViewCount
              />
            </div>
            <div className="pt-6">
              <RankedArticleList title="Latest Read" icon={Clock} articles={latestRead} />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
