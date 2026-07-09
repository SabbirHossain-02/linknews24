"use client";

import { useState } from "react";
import {
  Bookmark,
  Clock,
  Hash,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { TranslationKey } from "@/lib/i18n";
import { AuthModal } from "@/components/layout/AuthModal";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { StatTiles } from "@/components/dashboard/StatTiles";
import { ForYouFeed } from "@/components/dashboard/ForYouFeed";
import { FollowedTopics } from "@/components/dashboard/FollowedTopics";
import { SavedArticlesList } from "@/components/dashboard/SavedArticlesList";
import { HistoryList } from "@/components/dashboard/HistoryList";
import { PreferencesPanel } from "@/components/dashboard/PreferencesPanel";
import { AccountSettings } from "@/components/dashboard/AccountSettings";

type TabKey = "overview" | "saved" | "history" | "following" | "settings";

const TABS: { key: TabKey; label: TranslationKey; icon: typeof Bookmark }[] = [
  { key: "overview", label: "overview", icon: LayoutDashboard },
  { key: "saved", label: "savedNews", icon: Bookmark },
  { key: "history", label: "readingHistory", icon: Clock },
  { key: "following", label: "followingTab", icon: Hash },
  { key: "settings", label: "settings", icon: Settings },
];

export default function DashboardPage() {
  const { user, ready, logout } = useAuth();
  const { t } = useLocale();
  const [tab, setTab] = useState<TabKey>("overview");

  if (!ready) {
    return <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10" />;
  }

  if (!user) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-4 px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-heading">
          {t("loginToViewDashboard")}
        </h1>
        <p className="max-w-sm font-ui text-sm text-foreground-muted">
          {t("loginToViewDashboardCopy")}
        </p>
        <AuthModal
          triggerLabel={t("signIn")}
          triggerClassName="rounded-lg bg-brand-crimson px-5 py-2.5 font-ui text-sm font-medium text-white transition-colors hover:bg-brand-crimson-dark"
        />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <h1 className="text-2xl font-bold text-heading">{t("myDashboard")}</h1>

      <div className="mt-6 flex flex-col gap-6 lg:grid lg:grid-cols-[220px_1fr] lg:items-start lg:gap-8">
        {/* Side nav */}
        <nav className="flex gap-2 overflow-x-auto lg:sticky lg:top-[190px] lg:flex-col lg:overflow-visible">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3.5 py-2.5 font-ui text-sm font-medium transition-colors lg:w-full ${
                tab === key
                  ? "bg-brand-crimson text-white shadow-sm"
                  : "text-foreground-muted hover:bg-surface hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {t(label)}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex min-w-0 flex-col gap-6">
          {tab === "overview" && (
            <>
              <ProfileCard user={user} onLogout={logout} />
              <StatTiles />
              <ForYouFeed limit={5} />
            </>
          )}
          {tab === "saved" && <SavedArticlesList />}
          {tab === "history" && <HistoryList />}
          {tab === "following" && <FollowedTopics />}
          {tab === "settings" && (
            <>
              <PreferencesPanel />
              <AccountSettings />
            </>
          )}
        </div>
      </div>
    </main>
  );
}
