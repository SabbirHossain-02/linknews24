"use client";

import { useEffect, useState } from "react";
import { Check, Plus } from "lucide-react";
import { getFollowedTopics, toggleTopic } from "@/lib/auth-storage";
import { API_BASE } from "@/lib/admin-api";
import { useLocale } from "@/components/providers/LocaleProvider";
import { ForYouFeed } from "./ForYouFeed";

interface Topic {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  parentId?: string | null;
}

export function FollowedTopics() {
  const { t, locale } = useLocale();
  const [follows, setFollows] = useState<string[]>([]);
  const [version, setVersion] = useState(0);
  const [categories, setCategories] = useState<Topic[]>([]);

  useEffect(() => {
    setFollows(getFollowedTopics());
    // The real category list from the newsroom, not a hardcoded one.
    fetch(`${API_BASE}/api/categories`)
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d.categories) ? d.categories : []))
      .catch(() => {});
  }, []);

  const handleToggle = (slug: string) => {
    toggleTopic(slug);
    setFollows(getFollowedTopics());
    setVersion((v) => v + 1);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
        <h2 className="text-lg font-bold text-heading">{t("followTopics")}</h2>
        <p className="mt-1 font-ui text-sm text-foreground-muted">
          {t("followTopicsCopy")}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.length === 0 && (
            <p className="font-ui text-sm text-foreground-muted">
              {t("noResultsFound")}
            </p>
          )}
          {categories.map((category) => {
            const active = follows.includes(category.slug);
            return (
              <button
                key={category.id}
                onClick={() => handleToggle(category.slug)}
                className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-ui text-sm font-medium transition-colors ${
                  active
                    ? "border-brand-crimson bg-brand-crimson text-white"
                    : "border-border text-foreground hover:border-brand-crimson hover:text-brand-crimson"
                }`}
              >
                {active ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
                {locale === "en" ? category.nameEn || category.name : category.name}
              </button>
            );
          })}
        </div>
      </div>

      <ForYouFeed key={version} />
    </div>
  );
}
