"use client";

import { useEffect } from "react";
import { recordHistory } from "@/lib/auth-storage";
import { API_BASE } from "@/lib/admin-api";
import type { Article } from "@/types/content";

export function RecordHistory({ article }: { article: Article }) {
  useEffect(() => {
    recordHistory({
      slug: article.slug,
      title: article.title,
      categoryName: article.category.name,
      categorySlug: article.category.slug,
    });

    // Count a view once per browser session per article.
    const key = `ln24-viewed-${article.slug}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1");
      fetch(`${API_BASE}/api/articles/${encodeURIComponent(article.slug)}/view`, {
        method: "POST",
      }).catch(() => {});
    }
  }, [article.slug, article.title, article.category.name, article.category.slug]);

  return null;
}
