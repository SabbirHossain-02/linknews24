"use client";

import { useEffect, useState } from "react";
import { Bookmark, BookOpen, Hash } from "lucide-react";
import {
  getBookmarks,
  getFollowedTopics,
  getHistory,
  pruneBookmarks,
  pruneHistory,
} from "@/lib/auth-storage";
import { liveSlugs } from "@/lib/live-slugs";
import { useLocale } from "@/components/providers/LocaleProvider";

export function StatTiles() {
  const { t, locale } = useLocale();
  const [stats, setStats] = useState({ saved: 0, read: 0, following: 0 });

  // Counted after the dead entries are dropped, so the tiles agree with the
  // lists below them.
  useEffect(() => {
    const saved = getBookmarks();
    const read = getHistory();
    const following = getFollowedTopics().length;
    setStats({ saved: saved.length, read: read.length, following });

    const slugs = [...saved.map((b) => b.slug), ...read.map((h) => h.slug)];
    if (!slugs.length) return;
    liveSlugs(slugs).then((live) => {
      if (!live) return;
      pruneBookmarks(live);
      pruneHistory(live);
      setStats({
        saved: saved.filter((b) => live.has(b.slug)).length,
        read: read.filter((h) => live.has(h.slug)).length,
        following,
      });
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
