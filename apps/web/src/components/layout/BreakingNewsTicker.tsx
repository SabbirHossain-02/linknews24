"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_BASE } from "@/lib/admin-api";
import { getSocket } from "@/lib/socket";
import { useLocale } from "@/components/providers/LocaleProvider";

interface ApiBreaking {
  id: string;
  text: string;
  textEn: string;
  /** Set when the line is a published article flagged as breaking. */
  href: string | null;
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

  const items = (apiItems ?? []).map((i) => ({
    key: i.id,
    text: locale === "en" ? i.textEn || i.text : i.text,
    href: i.href,
  }));

  // Nothing to announce means no bar at all. A ticker filled with made-up
  // headlines would read as real breaking news.
  if (!items.length) return null;

  return (
    <div className="flex items-stretch bg-brand-crimson text-white">
      <span className="flex shrink-0 items-center bg-brand-crimson-dark px-4 py-2 font-ui text-xs font-bold uppercase tracking-wider">
        {t("breaking")}
      </span>
      <div className="group relative flex flex-1 items-center overflow-hidden">
        <div className="flex shrink-0 animate-ticker items-center gap-16 whitespace-nowrap py-2 pl-6 group-hover:[animation-play-state:paused]">
          {[...items, ...items].map((item, i) =>
            item.href ? (
              <Link
                key={`${item.key}-${i}`}
                href={item.href}
                className="text-sm underline-offset-4 hover:underline"
              >
                {item.text}
              </Link>
            ) : (
              <span key={`${item.key}-${i}`} className="text-sm">
                {item.text}
              </span>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
