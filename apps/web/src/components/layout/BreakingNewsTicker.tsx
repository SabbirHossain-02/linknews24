"use client";

import { breakingNewsItems, breakingNewsItemsEn } from "@/lib/mock-data";
import { useLocale } from "@/components/providers/LocaleProvider";

export function BreakingNewsTicker() {
  const { locale, t } = useLocale();
  const items = locale === "en" ? breakingNewsItemsEn : breakingNewsItems;

  return (
    <div className="flex items-stretch bg-brand-crimson text-white">
      <span className="flex shrink-0 items-center bg-brand-crimson-dark px-4 py-2 font-ui text-xs font-bold uppercase tracking-wider">
        {t("breaking")}
      </span>
      <div className="group relative flex flex-1 items-center overflow-hidden">
        <div className="flex shrink-0 animate-ticker items-center gap-16 whitespace-nowrap py-2 pl-6 group-hover:[animation-play-state:paused]">
          {[...items, ...items].map((item, i) => (
            <span key={i} className="text-sm">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
