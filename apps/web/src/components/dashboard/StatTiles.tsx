"use client";

import { useEffect, useState } from "react";
import { Bookmark, BookOpen, Hash } from "lucide-react";
import {
  getBookmarks,
  getFollowedTopics,
  getHistory,
} from "@/lib/auth-storage";
import { useLocale } from "@/components/providers/LocaleProvider";

export function StatTiles() {
  const { t, locale } = useLocale();
  const [stats, setStats] = useState({ saved: 0, read: 0, following: 0 });

  useEffect(() => {
    setStats({
      saved: getBookmarks().length,
      read: getHistory().length,
      following: getFollowedTopics().length,
    });
  }, []);

  const format = (n: number) =>
    locale === "bn" ? n.toLocaleString("bn-BD") : String(n);

  const tiles = [
    { icon: Bookmark, label: t("statSaved"), value: stats.saved },
    { icon: BookOpen, label: t("statRead"), value: stats.read },
    { icon: Hash, label: t("statFollowing"), value: stats.following },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {tiles.map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className="flex flex-col gap-2 rounded-xl border border-border bg-background p-4 shadow-sm"
        >
          <Icon className="h-5 w-5 text-brand-crimson" />
          <span className="text-2xl font-bold tabular-nums text-heading">
            {format(value)}
          </span>
          <span className="font-ui text-xs text-foreground-muted">{label}</span>
        </div>
      ))}
    </div>
  );
}
