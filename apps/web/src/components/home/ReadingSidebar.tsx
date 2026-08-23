"use client";

import { Flame } from "lucide-react";
import type { Article } from "@/types/content";
import { useLocale } from "@/components/providers/LocaleProvider";
import { RankedArticleList } from "./RankedArticleList";
import { RecentlyRead } from "./RecentlyRead";
import { LiveTV } from "./LiveTV";
import { AdSlot } from "@/components/ads/AdSlot";

export function ReadingSidebar({ mostRead }: { mostRead: Article[] }) {
  const { t } = useLocale();

  return (
    <div className="sticky top-[190px] flex max-h-[calc(100vh-190px-2rem)] flex-col gap-4">
      <LiveTV />
      <AdSlot placement="SIDEBAR" className="rounded-xl border border-border" />
      <aside className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-background shadow-[0_1px_2px_rgba(20,24,31,0.04),0_8px_24px_rgba(20,24,31,0.06)]">
        <div className="h-1 shrink-0 bg-gradient-to-r from-brand-crimson to-brand-crimson-dark" />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex flex-col divide-y divide-border p-5">
            <div className="pb-6">
              {mostRead.length === 0 ? (
                <>
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-crimson/10 text-brand-crimson">
                      <Flame className="h-4 w-4" />
                    </span>
                    <h2 className="font-ui text-sm font-bold uppercase tracking-wider text-heading">
                      {t("mostRead")}
                    </h2>
                  </div>
                  <p className="mt-3 font-ui text-[12.5px] leading-relaxed text-foreground-muted">
                    {t("mostReadEmpty")}
                  </p>
                </>
              ) : (
                <RankedArticleList
                  title={t("mostRead")}
                  icon={Flame}
                  articles={mostRead}
                  showViewCount
                />
              )}
            </div>
            <div className="pt-6">
              <RecentlyRead />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
