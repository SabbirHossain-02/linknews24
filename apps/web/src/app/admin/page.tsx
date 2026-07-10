"use client";

import { Newspaper, Radio, Tv, Users } from "lucide-react";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useAdminT, type AdminKey } from "@/lib/admin-i18n";

const STATS: { key: AdminKey; icon: typeof Newspaper }[] = [
  { key: "statTotalArticles", icon: Newspaper },
  { key: "statBreaking", icon: Radio },
  { key: "statLiveTv", icon: Tv },
  { key: "statAdmins", icon: Users },
];

export default function AdminDashboard() {
  const { user } = useAdminAuth();
  const t = useAdminT();

  return (
    <div>
      <h1 className="text-2xl font-bold text-heading">{t("dashboard")}</h1>
      <p className="mt-1 font-ui text-sm text-foreground-muted">
        {t("dashWelcome", { name: user?.name ?? "" })}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map(({ key, icon: Icon }) => (
          <div
            key={key}
            className="rounded-xl border border-border bg-background p-5 shadow-sm"
          >
            <Icon className="h-5 w-5 text-brand-crimson" />
            <p className="mt-3 text-2xl font-bold text-heading">—</p>
            <p className="font-ui text-xs text-foreground-muted">{t(key)}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-dashed border-border bg-background p-6 text-center font-ui text-sm text-foreground-muted">
        {t("dashNote")}
      </div>
    </div>
  );
}
