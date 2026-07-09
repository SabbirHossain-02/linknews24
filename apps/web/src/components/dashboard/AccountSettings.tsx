"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/components/providers/LocaleProvider";

const MIN_SCALE = 0.9;
const MAX_SCALE = 1.3;
const STEP = 0.1;
const FONT_KEY = "linknews24-font-scale";

export function AccountSettings() {
  const { t, locale, setLocale } = useLocale();
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const stored = Number(localStorage.getItem(FONT_KEY));
    if (stored) setScale(stored);
  }, []);

  const adjust = (delta: number) => {
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, +(scale + delta).toFixed(1)));
    setScale(next);
    document.documentElement.style.setProperty("--font-scale", String(next));
    localStorage.setItem(FONT_KEY, String(next));
  };

  return (
    <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
      <div className="flex flex-col divide-y divide-border">
        {/* Default language */}
        <div className="flex items-center justify-between py-3 first:pt-0">
          <span className="text-sm text-foreground">{t("defaultLanguage")}</span>
          <div className="flex rounded-lg bg-surface p-1">
            {(["bn", "en"] as const).map((lng) => (
              <button
                key={lng}
                onClick={() => setLocale(lng)}
                className={`rounded-md px-3 py-1 font-ui text-xs font-semibold transition-colors ${
                  locale === lng
                    ? "bg-background text-brand-crimson shadow-sm"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                {lng === "bn" ? "বাংলা" : "English"}
              </button>
            ))}
          </div>
        </div>

        {/* Font size */}
        <div className="flex items-center justify-between py-3 last:pb-0">
          <span className="text-sm text-foreground">{t("fontSize")}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => adjust(-STEP)}
              disabled={scale <= MIN_SCALE}
              aria-label="ছোট"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-sm font-bold transition-colors hover:bg-surface disabled:opacity-30"
            >
              অ−
            </button>
            <span className="w-10 text-center font-ui text-sm tabular-nums text-foreground-muted">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => adjust(STEP)}
              disabled={scale >= MAX_SCALE}
              aria-label="বড়"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-base font-bold transition-colors hover:bg-surface disabled:opacity-30"
            >
              অ+
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
