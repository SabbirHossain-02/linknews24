"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { clearHistory, getHistory, type HistoryEntry } from "@/lib/auth-storage";

export function HistoryList() {
  const [items, setItems] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setItems(getHistory());
  }, []);

  const handleClear = () => {
    clearHistory();
    setItems([]);
  };

  return (
    <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-heading">পঠিত ইতিহাস</h2>
        {items.length > 0 && (
          <button
            onClick={handleClear}
            className="font-ui text-xs font-medium text-brand-crimson hover:underline"
          >
            মুছে ফেলুন
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="mt-3 font-ui text-sm text-foreground-muted">
          এখনো কোনো আর্টিকেল পড়েননি।
        </p>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-border">
          {items.map((item) => (
            <li key={item.slug} className="py-3 first:pt-0 last:pb-0">
              <Link href={`/${item.slug}`} className="group block">
                <span className="font-ui text-xs font-semibold uppercase tracking-wide text-brand-crimson">
                  {item.categoryName}
                </span>
                <p className="mt-0.5 truncate text-sm font-medium text-foreground transition-colors group-hover:text-brand-crimson">
                  {item.title}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
