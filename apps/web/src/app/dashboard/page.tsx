"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { AuthModal } from "@/components/layout/AuthModal";
import { ProfileCard } from "@/components/dashboard/ProfileCard";
import { SavedArticlesList } from "@/components/dashboard/SavedArticlesList";
import { HistoryList } from "@/components/dashboard/HistoryList";
import { PreferencesPanel } from "@/components/dashboard/PreferencesPanel";

export default function DashboardPage() {
  const { user, ready, logout } = useAuth();

  if (!ready) {
    return <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10" />;
  }

  if (!user) {
    return (
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center gap-4 px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-heading">ড্যাশবোর্ড দেখতে লগইন করুন</h1>
        <p className="max-w-sm font-ui text-sm text-foreground-muted">
          সংরক্ষিত সংবাদ, পঠিত ইতিহাস ও প্রেফারেন্স দেখতে আপনার অ্যাকাউন্টে লগইন করুন।
        </p>
        <AuthModal
          triggerLabel="লগইন করুন"
          triggerClassName="rounded-lg bg-brand-crimson px-5 py-2.5 font-ui text-sm font-medium text-white transition-colors hover:bg-brand-crimson-dark"
        />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <h1 className="text-2xl font-bold text-heading">আমার ড্যাশবোর্ড</h1>
      <div className="mt-6 flex flex-col gap-6">
        <ProfileCard user={user} onLogout={logout} />
        <SavedArticlesList />
        <HistoryList />
        <PreferencesPanel />
      </div>
    </main>
  );
}
