"use client";

import { useEffect } from "react";
import { recordHistory } from "@/lib/auth-storage";
import type { Article } from "@/types/content";

export function RecordHistory({ article }: { article: Article }) {
  useEffect(() => {
    recordHistory({
      slug: article.slug,
      title: article.title,
      categoryName: article.category.name,
      categorySlug: article.category.slug,
    });
  }, [article.slug, article.title, article.category.name, article.category.slug]);

  return null;
}
