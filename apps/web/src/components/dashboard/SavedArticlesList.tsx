"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { getBookmarks, removeBookmark, type BookmarkedArticle } from "@/lib/auth-storage";
import { useLocale } from "@/components/providers/LocaleProvider";

export function SavedArticlesList() {
  const [items, setItems] = useState<BookmarkedArticle[]>([]);
  const { t } = useLocale();

  useEffect(() => {
    setItems(getBookmarks());
  }, []);

  const handleRemove = (slug: string) => {
    removeBookmark(slug);
    setItems(getBookmarks());
  };

  return (
    <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
      <h2 className="text-lg font-bold text-heading">{t("savedNews")}</h2>
      {items.length === 0 ? (
        <p className="mt-3 font-ui text-sm text-foreground-muted">{t("noSavedNews")}</p>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-border">
          {items.map((item) => (
            <li
              key={item.slug}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <Link href={`/${item.slug}`} className="group min-w-0 flex-1">
                <span className="font-ui text-xs font-semibold uppercase tracking-wide text-brand-crimson">
                  {item.categoryName}
                </span>
                <p className="mt-0.5 truncate text-sm font-medium text-foreground transition-colors group-hover:text-brand-crimson">
                  {item.title}
                </p>
              </Link>
              <button
                onClick={() => handleRemove(item.slug)}
                aria-label={t("removeSaved")}
                className="shrink-0 text-foreground-muted transition-colors hover:text-brand-crimson"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
