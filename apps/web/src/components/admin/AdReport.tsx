"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/admin-api";
import { getSocket } from "@/lib/socket";
import { useAdminT } from "@/lib/admin-i18n";
import { LineChart } from "./charts/LineChart";

interface Day {
  day: string;
  impressions: number;
  clicks: number;
}

interface ReportAd {
  id: string;
  name: string;
  placement: string;
  status: string;
  impressions: number;
  clicks: number;
  periodImpressions: number;
  periodClicks: number;
  series: Day[];
}

interface Report {
  days: string[];
  totals: Day[];
  ads: ReportAd[];
}

const RANGES = [7, 14, 30];

const ctr = (clicks: number, impressions: number) =>
  impressions > 0 ? `${((clicks / impressions) * 100).toFixed(2)}%` : "—";

/** "2026-08-24" → "24 Aug" */
const shortDay = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });

/**
 * Day-by-day advertising performance.
 *
 * The running totals on an ad cannot answer the question an advertiser actually
 * asks — "how did my campaign do last week?" — so every impression and click is
 * kept as a dated row and summed here. It refreshes on the API's realtime
 * signal, so a click on the site shows up here while you are looking at it.
 */
export function AdReport() {
  const t = useAdminT();
  const [days, setDays] = useState(14);
  const [report, setReport] = useState<Report | null>(null);
  const [metric, setMetric] = useState<"impressions" | "clicks">("impressions");

  const load = useCallback(() => {
    apiFetch<Report>(`/api/admin/ads/report?days=${days}`)
      .then(setReport)
      .catch(() => {});
  }, [days]);

  useEffect(() => {
    load();
    const socket = getSocket();
    socket.on("analytics:changed", load);
    socket.on("content:changed", load);
    return () => {
      socket.off("analytics:changed", load);
      socket.off("content:changed", load);
    };
  }, [load]);

  if (!report) return null;

  const periodImpressions = report.totals.reduce((s, d) => s + d.impressions, 0);
  const periodClicks = report.totals.reduce((s, d) => s + d.clicks, 0);
  const nothingYet = periodImpressions === 0 && periodClicks === 0;

  return (
    <section className="mt-8 rounded-xl border border-border bg-background">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div>
          <h2 className="font-ui text-sm font-semibold text-heading">
            {t("adReport")}
          </h2>
          <p className="mt-0.5 font-ui text-xs text-foreground-muted">
            {t("adReportNote")}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {RANGES.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={`rounded-lg px-2.5 py-1 font-ui text-xs font-semibold transition-colors ${
                days === d
                  ? "bg-brand-crimson text-white"
                  : "text-foreground-muted hover:bg-surface"
              }`}
            >
              {d} {t("adDays")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 px-5 py-4 sm:grid-cols-3">
        <Stat label={t("dashImpressions")} value={periodImpressions} />
        <Stat label={t("dashClicks")} value={periodClicks} />
        <Stat label={t("dashCtr")} value={ctr(periodClicks, periodImpressions)} />
      </div>

      {nothingYet ? (
        <p className="px-5 pb-6 font-ui text-sm text-foreground-muted">
          {t("adReportEmpty")}
        </p>
      ) : (
        <>
          <div className="px-5">
            <div className="flex items-center gap-1">
              {(["impressions", "clicks"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMetric(m)}
                  className={`rounded-lg px-2.5 py-1 font-ui text-xs font-semibold transition-colors ${
                    metric === m
                      ? "bg-surface text-heading"
                      : "text-foreground-muted hover:bg-surface/60"
                  }`}
                >
                  {m === "impressions" ? t("dashImpressions") : t("dashClicks")}
                </button>
              ))}
            </div>
            <LineChart
              data={report.totals.map((d) => ({
                label: shortDay(d.day),
                value: d[metric],
              }))}
            />
          </div>

          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-y border-border font-ui text-xs uppercase tracking-wide text-foreground-muted/70">
                <tr>
                  <th className="px-5 py-2.5">{t("adName")}</th>
                  <th className="px-5 py-2.5">{t("dashImpressions")}</th>
                  <th className="px-5 py-2.5">{t("dashClicks")}</th>
                  <th className="px-5 py-2.5">{t("dashCtr")}</th>
                  <th className="px-5 py-2.5">{t("adLifetime")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {report.ads.map((a) => (
                  <tr key={a.id} className="hover:bg-surface/50">
                    <td className="px-5 py-2.5">
                      <p className="font-medium text-foreground">{a.name}</p>
                      <p className="font-ui text-xs text-foreground-muted">
                        {a.placement}
                      </p>
                    </td>
                    <td className="px-5 py-2.5 text-foreground-muted tabular-nums">
                      {a.periodImpressions}
                    </td>
                    <td className="px-5 py-2.5 text-foreground-muted tabular-nums">
                      {a.periodClicks}
                    </td>
                    <td className="px-5 py-2.5 text-foreground-muted tabular-nums">
                      {ctr(a.periodClicks, a.periodImpressions)}
                    </td>
                    <td className="px-5 py-2.5 font-ui text-xs text-foreground-muted tabular-nums">
                      {a.impressions} / {a.clicks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border px-4 py-3">
      <p className="text-xl font-bold tabular-nums text-heading">{value}</p>
      <p className="font-ui text-xs text-foreground-muted">{label}</p>
    </div>
  );
}
