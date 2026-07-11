"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Eye,
  MessageSquare,
  MousePointerClick,
  Newspaper,
  Radio,
  Users,
  Wifi,
} from "lucide-react";
import { apiFetch } from "@/lib/admin-api";
import { getSocket } from "@/lib/socket";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useAdminT } from "@/lib/admin-i18n";
import { LineChart } from "@/components/admin/charts/LineChart";
import { DonutChart } from "@/components/admin/charts/DonutChart";
import { BarList } from "@/components/admin/charts/BarList";

interface Analytics {
  totals: {
    totalViews: number;
    todayViews: number;
    uniqueToday: number;
    online: number;
    articles: number;
    breaking: number;
    pendingComments: number;
    adImpressions: number;
    adClicks: number;
  };
  hourly: { hour: string; count: number }[];
  devices: { label: string; count: number }[];
  browsers: { label: string; count: number }[];
  countries: { label: string; count: number }[];
  referrers: { label: string; count: number }[];
  recent: {
    path: string;
    ip: string | null;
    country: string | null;
    city: string | null;
    device: string | null;
    browser: string | null;
    os: string | null;
    createdAt: string;
  }[];
  ads: { id: string; name: string; impressions: number; clicks: number }[];
}

// ISO-2 country code → flag emoji.
function flag(cc: string | null) {
  if (!cc || cc.length !== 2) return "🌐";
  return String.fromCodePoint(
    ...[...cc.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

export default function AdminDashboard() {
  const { user } = useAdminAuth();
  const t = useAdminT();
  const [data, setData] = useState<Analytics | null>(null);
  const lastFetch = useRef(0);
  const pending = useRef(false);
  const gotData = useRef(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Cache the last snapshot so the dashboard shows instantly on the next open
  // instead of flashing "—" while the request is in flight.
  const CACHE_KEY = "ln24-admin-analytics";

  const load = useCallback(() => {
    lastFetch.current = Date.now();
    return apiFetch<Analytics>("/api/admin/analytics")
      .then((d) => {
        gotData.current = true;
        setLoadError(null);
        setData(d);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(d));
        } catch {
          /* ignore quota */
        }
      })
      .catch((e) => {
        if (!gotData.current)
          setLoadError(e instanceof Error ? e.message : "load failed");
      });
  }, []);

  useEffect(() => {
    // 1) Instant paint from cache.
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) setData(JSON.parse(cached));
    } catch {
      /* ignore */
    }
    // 2) Fresh fetch, with fast retries until the first success (self-heals
    //    transient failures right after an API restart / cold start).
    load();
    const retries = [1500, 3500, 7000];
    const timers = retries.map((ms) =>
      setTimeout(() => {
        if (!gotData.current) load();
      }, ms),
    );

    const socket = getSocket();
    // Throttle refetches so a burst of visits doesn't hammer the API.
    const onEvent = () => {
      const since = Date.now() - lastFetch.current;
      if (since > 4000) {
        load();
      } else if (!pending.current) {
        pending.current = true;
        setTimeout(() => {
          pending.current = false;
          load();
        }, 4000 - since);
      }
    };
    socket.on("analytics:changed", onEvent);
    socket.on("content:changed", onEvent);
    const interval = setInterval(load, 20000); // fallback refresh
    return () => {
      socket.off("analytics:changed", onEvent);
      socket.off("content:changed", onEvent);
      clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  }, [load]);

  const tt = data?.totals;
  const ctr =
    tt && tt.adImpressions > 0
      ? ((tt.adClicks / tt.adImpressions) * 100).toFixed(1)
      : "0.0";

  const cards = [
    { label: t("dashOnline"), value: tt?.online, icon: Wifi, live: true },
    { label: t("dashToday"), value: tt?.todayViews, icon: Eye },
    { label: t("dashUniqueToday"), value: tt?.uniqueToday, icon: Users },
    { label: t("dashTotalViews"), value: tt?.totalViews, icon: Eye },
    { label: t("statTotalArticles"), value: tt?.articles, icon: Newspaper },
    { label: t("statBreaking"), value: tt?.breaking, icon: Radio },
    { label: t("pendingCommentsStat"), value: tt?.pendingComments, icon: MessageSquare },
    { label: t("dashClicks"), value: tt?.adClicks, icon: MousePointerClick },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-heading">{t("dashboard")}</h1>
          <p className="mt-1 font-ui text-sm text-foreground-muted">
            {t("dashWelcome", { name: user?.name ?? "" })}
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 font-ui text-xs font-semibold text-green-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-600" />
          </span>
          {t("dashLive")}
        </span>
      </div>

      {loadError && !data && (
        <p className="mt-4 rounded-lg bg-brand-crimson/10 px-3.5 py-2 font-ui text-sm text-brand-crimson">
          ডেটা লোড করা যায়নি: {loadError} — কয়েক সেকেন্ডে আবার চেষ্টা হচ্ছে…
        </p>
      )}

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-border bg-background p-5 shadow-sm"
          >
            <c.icon
              className={`h-5 w-5 ${c.live ? "text-green-600" : "text-brand-crimson"}`}
            />
            <p className="mt-3 text-2xl font-bold text-heading">{c.value ?? "—"}</p>
            <p className="font-ui text-xs text-foreground-muted">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Hourly line chart */}
      <div className="mt-6 rounded-xl border border-border bg-background p-5">
        <h2 className="font-ui text-sm font-semibold text-heading">{t("dashHourly")}</h2>
        <div className="mt-3">
          {data && data.hourly.some((h) => h.count > 0) ? (
            <LineChart
              data={data.hourly.map((h) => ({ label: h.hour, value: h.count }))}
            />
          ) : (
            <p className="py-10 text-center font-ui text-sm text-foreground-muted">
              {t("dashNoVisitors")}
            </p>
          )}
        </div>
      </div>

      {/* Breakdown grid */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-background p-5">
          <h2 className="font-ui text-sm font-semibold text-heading">{t("dashDevices")}</h2>
          <div className="mt-4">
            <DonutChart
              data={(data?.devices ?? []).map((d) => ({ label: d.label, value: d.count }))}
            />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-background p-5">
          <h2 className="font-ui text-sm font-semibold text-heading">{t("dashBrowsers")}</h2>
          <div className="mt-4">
            <DonutChart
              data={(data?.browsers ?? []).map((d) => ({ label: d.label, value: d.count }))}
            />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-background p-5">
          <h2 className="mb-3 font-ui text-sm font-semibold text-heading">
            {t("dashCountries")}
          </h2>
          <BarList
            rows={(data?.countries ?? []).map((c) => ({
              label: `${flag(c.label === "—" ? null : c.label)}  ${c.label}`,
              count: c.count,
            }))}
          />
        </div>
        <div className="rounded-xl border border-border bg-background p-5">
          <h2 className="mb-3 font-ui text-sm font-semibold text-heading">
            {t("dashReferrers")}
          </h2>
          <BarList rows={data?.referrers ?? []} />
        </div>
      </div>

      {/* Recent visitors */}
      <div className="mt-6 rounded-xl border border-border bg-background">
        <h2 className="border-b border-border px-5 py-3 font-ui text-sm font-semibold text-heading">
          {t("dashRecent")}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border font-ui text-xs uppercase tracking-wide text-foreground-muted/70">
              <tr>
                <th className="px-5 py-2.5">{t("colVisitor")}</th>
                <th className="px-5 py-2.5">{t("colPage")}</th>
                <th className="px-5 py-2.5">{t("colDevice")}</th>
                <th className="px-5 py-2.5">{t("colLocation")}</th>
                <th className="px-5 py-2.5">{t("colTime")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(data?.recent ?? []).length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-foreground-muted">
                    {t("dashNoVisitors")}
                  </td>
                </tr>
              ) : (
                data!.recent.map((r, i) => (
                  <tr key={i} className="hover:bg-surface/50">
                    <td className="px-5 py-2.5 font-ui text-xs text-foreground">
                      {r.ip || "—"}
                    </td>
                    <td className="max-w-[220px] truncate px-5 py-2.5 text-foreground-muted">
                      {r.path}
                    </td>
                    <td className="px-5 py-2.5 text-foreground-muted">
                      {r.device} · {r.browser}
                    </td>
                    <td className="px-5 py-2.5 text-foreground-muted">
                      {flag(r.country)} {r.city ? `${r.city}, ` : ""}
                      {r.country || "—"}
                    </td>
                    <td className="whitespace-nowrap px-5 py-2.5 font-ui text-xs text-foreground-muted">
                      {new Date(r.createdAt).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" · "}
                      {new Date(r.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ad performance */}
      {data && data.ads.length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-background">
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="font-ui text-sm font-semibold text-heading">{t("dashAdPerf")}</h2>
            <span className="font-ui text-xs text-foreground-muted">
              {t("dashCtr")}: {ctr}%
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border font-ui text-xs uppercase tracking-wide text-foreground-muted/70">
                <tr>
                  <th className="px-5 py-2.5">{t("adName")}</th>
                  <th className="px-5 py-2.5">{t("dashImpressions")}</th>
                  <th className="px-5 py-2.5">{t("dashClicks")}</th>
                  <th className="px-5 py-2.5">{t("dashCtr")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data.ads.map((a) => (
                  <tr key={a.id} className="hover:bg-surface/50">
                    <td className="px-5 py-2.5 font-medium text-foreground">{a.name}</td>
                    <td className="px-5 py-2.5 text-foreground-muted">{a.impressions}</td>
                    <td className="px-5 py-2.5 text-foreground-muted">{a.clicks}</td>
                    <td className="px-5 py-2.5 text-foreground-muted">
                      {a.impressions > 0
                        ? ((a.clicks / a.impressions) * 100).toFixed(1)
                        : "0.0"}
                      %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
