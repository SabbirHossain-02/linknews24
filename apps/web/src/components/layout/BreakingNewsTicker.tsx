"use client";

import { useEffect, useState } from "react";
import { breakingNewsItems, breakingNewsItemsEn } from "@/lib/mock-data";
import { API_BASE } from "@/lib/admin-api";
import { getSocket } from "@/lib/socket";
import { useLocale } from "@/components/providers/LocaleProvider";

interface ApiBreaking {
  text: string;
  textEn: string;
}

export function BreakingNewsTicker() {
  const { locale, t } = useLocale();
  const [apiItems, setApiItems] = useState<ApiBreaking[] | null>(null);

  useEffect(() => {
    const refetch = () =>
      fetch(`${API_BASE}/api/breaking`)
        .then((r) => r.json())
        .then((d) => {
          if (Array.isArray(d.items)) setApiItems(d.items.length ? d.items : null);
        })
        .catch(() => {});

    refetch();
    const socket = getSocket();
    socket.on("content:changed", refetch);
    return () => {
      socket.off("content:changed", refetch);
    };
  }, []);

  const items = apiItems
    ? apiItems.map((i) => (locale === "en" ? i.textEn || i.text : i.text))
    : locale === "en"
      ? breakingNewsItemsEn
      : breakingNewsItems;

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
