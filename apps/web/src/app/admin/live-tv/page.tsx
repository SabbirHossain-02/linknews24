"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/admin-api";
import { useAdminT } from "@/lib/admin-i18n";

interface LiveTv {
  streamUrl: string;
  active: boolean;
  title: string;
  titleEn: string;
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-brand-crimson focus:outline-none focus:ring-2 focus:ring-brand-crimson/15";

export default function LiveTvAdminPage() {
  const t = useAdminT();
  const [live, setLive] = useState<LiveTv>({
    streamUrl: "",
    active: false,
    title: "লাইভ টিভি",
    titleEn: "Live TV",
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiFetch<{ live: LiveTv }>("/api/admin/livetv")
      .then((d) => d.live && setLive(d.live))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setBusy(true);
    setSaved(false);
    try {
      await apiFetch("/api/admin/livetv", {
        method: "PUT",
        body: JSON.stringify(live),
      });
      setSaved(true);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-heading">{t("liveTv")}</h1>
      <p className="mt-1 font-ui text-sm text-foreground-muted">{t("liveNote")}</p>

      <div className="mt-5 flex flex-col gap-4 rounded-xl border border-border bg-background p-5">
        <div>
          <label className="font-ui text-xs font-semibold text-foreground-muted">
            {t("streamUrl")}
          </label>
          <input
            value={live.streamUrl}
            onChange={(e) => setLive({ ...live, streamUrl: e.target.value })}
            placeholder="https://www.youtube.com/embed/…"
            className={`${inputCls} mt-1`}
          />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="font-ui text-xs font-semibold text-foreground-muted">
              {t("titleBnLabel")}
            </label>
            <input
              value={live.title}
              onChange={(e) => setLive({ ...live, title: e.target.value })}
              className={`${inputCls} mt-1`}
            />
          </div>
          <div className="flex-1">
            <label className="font-ui text-xs font-semibold text-foreground-muted">
              {t("titleEnLabel")}
            </label>
            <input
              value={live.titleEn}
              onChange={(e) => setLive({ ...live, titleEn: e.target.value })}
              className={`${inputCls} mt-1`}
            />
          </div>
        </div>
        <label className="flex cursor-pointer items-center justify-between">
          <span className="font-ui text-sm text-foreground">{t("liveActive")}</span>
          <button
            type="button"
            role="switch"
            aria-checked={live.active}
            onClick={() => setLive({ ...live, active: !live.active })}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              live.active ? "bg-brand-crimson" : "bg-border"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                live.active ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </label>

        <div className="flex items-center gap-3">
          <button
            onClick={save}
            disabled={busy}
            className="rounded-lg bg-brand-crimson px-5 py-2.5 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark disabled:opacity-60"
          >
            {busy ? t("saving") : t("save")}
          </button>
          {saved && (
            <span className="font-ui text-sm text-green-600">✓ {t("save")}</span>
          )}
        </div>
      </div>
    </div>
  );
}
