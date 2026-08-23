"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { getHistory, type HistoryEntry } from "@/lib/auth-storage";
import { useLocale } from "@/components/providers/LocaleProvider";

/**
 * What this reader has actually opened, newest first.
 *
 * This used to repeat the latest published articles under a "Latest Read"
 * heading, which said nothing about reading at all. The site already records
 * every article a visitor opens, so the list now shows that.
 */
export function RecentlyRead({ limit = 5 }: { limit?: number }) {
  const { t, locale } = useLocale();
  const [items, setItems] = useState<HistoryEntry[] | null>(null);

  // localStorage is only readable in the browser, so the list arrives after
  // the first paint. `null` means "not looked yet" and renders nothing.
  useEffect(() => {
    setItems(getHistory().slice(0, limit));
  }, [limit]);

  if (items === null) return null;

  return (
    <div>
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-crimson/10 text-brand-crimson">
          <Clock className="h-4 w-4" />
        </span>
        <h2 className="font-ui text-sm font-bold uppercase tracking-wider text-heading">
          {t("latestRead")}
        </h2>
      </div>

      {items.length === 0 ? (
        <p className="mt-3 font-ui text-[12.5px] leading-relaxed text-foreground-muted">
          {t("latestReadEmpty")}
        </p>
      ) : (
        <ol className="mt-4 flex flex-col divide-y divide-border">
          {items.map((entry, index) => (
            <li key={entry.slug} className="py-3.5 first:pt-0 last:pb-0">
              <Link
                href={`/${entry.slug}`}
                className="group flex items-start gap-3.5"
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-ui text-[11px] font-bold transition-colors ${
                    index === 0
                      ? "bg-brand-crimson text-white"
                      : "bg-heading/[0.06] text-heading/50 group-hover:bg-brand-crimson/10 group-hover:text-brand-crimson"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="min-w-0 text-[13.5px] font-semibold leading-snug text-foreground transition-colors group-hover:text-brand-crimson">
                  {locale === "en" ? entry.titleEn || entry.title : entry.title}
                </h3>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
