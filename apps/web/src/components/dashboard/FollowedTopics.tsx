"use client";

import { useEffect, useState } from "react";
import { Check, Plus } from "lucide-react";
import { getFollowedTopics, toggleTopic } from "@/lib/auth-storage";
import { categories } from "@/lib/mock-data";
import { localizedName } from "@/lib/i18n";
import { useLocale } from "@/components/providers/LocaleProvider";
import { ForYouFeed } from "./ForYouFeed";

export function FollowedTopics() {
  const { t, locale } = useLocale();
  const [follows, setFollows] = useState<string[]>([]);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    setFollows(getFollowedTopics());
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
                {localizedName(category, locale)}
              </button>
            );
          })}
        </div>
      </div>

      <ForYouFeed key={version} />
    </div>
  );
}
