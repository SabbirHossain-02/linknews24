"use client";

import { useCallback, useEffect, useState } from "react";
import { LogIn, LogOut, ShieldAlert, XCircle } from "lucide-react";
import { apiFetch } from "@/lib/admin-api";
import { getSocket } from "@/lib/socket";
import { useAdminT, type AdminKey } from "@/lib/admin-i18n";

interface Entry {
  id: string;
  action: "login" | "login_failed" | "login_locked" | "logout";
  detail: string | null;
  ip: string | null;
  userAgent: string | null;
  success: boolean;
  createdAt: string;
  user: { name: string; email: string } | null;
}

const ICONS = {
  login: LogIn,
  logout: LogOut,
  login_failed: XCircle,
  login_locked: ShieldAlert,
} as const;

/**
 * Who has signed in, and who has tried and failed.
 *
 * One failed attempt is nothing — everyone mistypes a password. Forty from one
 * address in the small hours is a break-in attempt, and until now there was no
 * record at all: it would simply have happened, unseen.
 */
export function LoginActivity() {
  const t = useAdminT();
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [denied, setDenied] = useState(false);

  const load = useCallback(
    () =>
      apiFetch<{ logins: Entry[] }>("/api/admin/security/logins?take=50")
        .then((d) => setEntries(d.logins))
        .catch(() => setDenied(true)),
    [],
  );

  useEffect(() => {
    load();
    // A sign-in elsewhere shows up here without a reload.
    const socket = getSocket();
    socket.on("content:changed", load);
    const timer = setInterval(load, 60_000);
    return () => {
      socket.off("content:changed", load);
      clearInterval(timer);
    };
  }, [load]);

  if (denied || !entries) return null;

  const failures = entries.filter((e) => !e.success).length;

  return (
    <section className="mt-6 rounded-xl border border-border bg-background">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3">
        <div>
          <h2 className="font-ui text-sm font-semibold text-heading">
            {t("securityLogins")}
          </h2>
          <p className="mt-0.5 font-ui text-xs text-foreground-muted">
            {t("securityLoginsNote")}
          </p>
        </div>
        {failures > 0 && (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 font-ui text-xs font-semibold text-amber-800">
            {t("securityFailedCount", { n: String(failures) })}
          </span>
        )}
      </div>

      {entries.length === 0 ? (
        <p className="px-5 py-8 text-center font-ui text-sm text-foreground-muted">
          {t("securityNoLogins")}
        </p>
      ) : (
        <div className="max-h-[420px] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 border-b border-border bg-background font-ui text-xs uppercase tracking-wide text-foreground-muted/70">
              <tr>
                <th className="px-5 py-2.5">{t("securityWhat")}</th>
                <th className="px-5 py-2.5">{t("securityWho")}</th>
                <th className="px-5 py-2.5">{t("securityFrom")}</th>
                <th className="px-5 py-2.5">{t("colTime")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries.map((e) => {
                const Icon = ICONS[e.action];
                return (
                  <tr
                    key={e.id}
                    className={e.success ? "" : "bg-brand-crimson/[0.03]"}
                  >
                    <td className="px-5 py-2.5">
                      <span className="flex items-center gap-2 font-ui text-xs">
                        <Icon
                          className={`h-3.5 w-3.5 shrink-0 ${
                            e.action === "login_locked"
                              ? "text-brand-crimson"
                              : e.success
                                ? "text-green-600"
                                : "text-amber-600"
                          }`}
                        />
                        {t(`security_${e.action}` as AdminKey)}
                      </span>
                    </td>
                    <td className="max-w-[200px] truncate px-5 py-2.5 font-ui text-xs text-foreground-muted">
                      {e.user ? `${e.user.name} · ${e.user.email}` : e.detail || "—"}
                    </td>
                    <td className="px-5 py-2.5 font-ui text-xs tabular-nums text-foreground-muted">
                      {e.ip || "—"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-2.5 font-ui text-xs text-foreground-muted">
                      {new Date(e.createdAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
