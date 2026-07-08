"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { isBookmarked, toggleBookmark } from "@/lib/auth-storage";
import type { Article } from "@/types/content";

export function BookmarkButton({ article }: { article: Article }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isBookmarked(article.slug));
  }, [article.slug]);

  const handleClick = () => {
    const nowSaved = toggleBookmark({
      slug: article.slug,
      title: article.title,
      categoryName: article.category.name,
      categorySlug: article.category.slug,
    });
    setSaved(nowSaved);
  };

  return (
    <button
      onClick={handleClick}
      aria-pressed={saved}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-ui text-xs font-medium transition-colors ${
        saved
          ? "border-brand-crimson bg-brand-crimson/10 text-brand-crimson"
          : "border-border text-foreground-muted hover:border-brand-crimson hover:text-brand-crimson"
      }`}
    >
      <Bookmark className="h-3.5 w-3.5" fill={saved ? "currentColor" : "none"} />
      {saved ? "সংরক্ষিত" : "সংরক্ষণ করুন"}
    </button>
  );
}
