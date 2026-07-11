"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { toLocaleDigits } from "@/lib/i18n";
import type { ApiEdition } from "@/lib/api";

export function EpaperView({ editions }: { editions: ApiEdition[] }) {
  const { locale, t } = useLocale();
  // editions come newest-first; index 0 = latest.
  const [index, setIndex] = useState(0);
  const current = editions[index];

  const formatDate = (iso: string) => {
    const label = new Date(iso).toLocaleDateString(
      locale === "bn" ? "bn-BD" : "en-GB",
      { weekday: "long", day: "numeric", month: "long", year: "numeric" },
    );
    return locale === "bn" ? toLocaleDigits(label, locale) : label;
  };

  if (!current) {
    return (
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
        <h1 className="text-2xl font-bold text-heading">{t("epaper")}</h1>
        <div className="mt-6 flex aspect-[3/4] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-surface px-8 text-center">
          <span className="text-xl font-bold tracking-tight text-heading/30">
            Link News<span className="text-brand-crimson/40">24</span>
          </span>
          <p className="font-semibold text-foreground">{t("epaperComingSoon")}</p>
          <p className="max-w-sm font-ui text-sm text-foreground-muted">
            {t("epaperComingSoonCopy")}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-heading">{t("epaper")}</h1>
        <a
          href={current.pdfUrl}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-lg bg-brand-navy px-4 py-2 font-ui text-sm font-medium text-white transition-colors hover:bg-brand-navy-soft"
        >
          <Download className="h-4 w-4" />
          {t("downloadPdf")}
        </a>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-2.5">
        <button
          onClick={() => setIndex((i) => Math.min(i + 1, editions.length - 1))}
          disabled={index >= editions.length - 1}
          aria-label={t("previousEdition")}
          className="text-foreground-muted transition-colors hover:text-brand-crimson disabled:text-foreground-muted/30"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="font-ui text-sm font-medium text-foreground">
          {formatDate(current.date)}
        </span>
        <button
          onClick={() => setIndex((i) => Math.max(i - 1, 0))}
          disabled={index <= 0}
          aria-label={t("nextEdition")}
          className="text-foreground-muted transition-colors hover:text-brand-crimson disabled:text-foreground-muted/30"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface">
        <iframe
          key={current.id}
          src={`${current.pdfUrl}#view=FitH`}
          title={formatDate(current.date)}
          className="h-[80vh] w-full"
        />
      </div>
    </main>
  );
}
