"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Info, Languages, Loader2 } from "lucide-react";
import { fill, useAdminText } from "@/lib/admin-strings";
import {
  translateArticle,
  translationAvailability,
  type Availability,
  type ArticleFields,
  type TranslateProgress,
} from "@/lib/translate";

export type Lang = "bn" | "en";

/**
 * Language switch for the article editor.
 *
 * One editor, two languages: write in Bangla, switch to English and have it
 * filled in by Chrome's on-device translator. The result is always editable and
 * is flagged as machine-translated until the editor confirms it, because news
 * wording carries legal weight — "accused" and "convicted" are not
 * interchangeable, and no engine gets that right every time.
 */
export function LanguageBar({
  lang,
  onLangChange,
  fields,
  onTranslated,
  machineTranslated,
  onConfirm,
}: {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  /** Current Bangla values, the source for translation. */
  fields: ArticleFields;
  onTranslated: (result: ArticleFields) => void;
  machineTranslated: boolean;
  onConfirm: () => void;
}) {
  const ax = useAdminText();
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [progress, setProgress] = useState<TranslateProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    translationAvailability().then(setAvailability);
  }, []);

  const busy = progress !== null;
  const hasBangla = Boolean(fields.title.trim() || fields.bodyHtml.trim());

  const runTranslation = async () => {
    setError(null);
    setProgress({ download: null, done: 0, total: 0 });
    try {
      const result = await translateArticle(fields, setProgress);
      onTranslated(result);
      onLangChange("en");
      setAvailability("available");
    } catch (err) {
      setError(
        err instanceof Error && err.message === "UNSUPPORTED"
          ? ax("এই ব্রাউজারে অনুবাদ সুবিধাটি নেই।")
          : ax("অনুবাদ করা যায়নি। আবার চেষ্টা করুন।"),
      );
    } finally {
      setProgress(null);
    }
  };

  const statusText = () => {
    if (!progress) return null;
    if (progress.download !== null)
      return fill(ax("ভাষা প্যাক নামছে… {n}%"), {
      n: Math.round(progress.download * 100),
    });
    if (progress.total)
      return fill(ax("অনুবাদ হচ্ছে… {a}/{b}"), {
      a: progress.done,
      b: progress.total,
    });
    return ax("শুরু হচ্ছে…");
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        {/* language switch */}
        <div className="inline-flex rounded-lg border border-border bg-surface p-0.5">
          {(["bn", "en"] as const).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => onLangChange(code)}
              className={`rounded-md px-4 py-1.5 font-ui text-xs font-semibold transition-colors ${
                lang === code
                  ? "bg-brand-crimson text-white"
                  : "text-foreground-muted hover:text-foreground"
              }`}
            >
              {code === "bn" ? "বাংলা" : "English"}
            </button>
          ))}
        </div>

        {/* translate action — only shown where it can actually run */}
        {availability === "unsupported" || availability === "unavailable" ? (
          <span className="flex items-center gap-1.5 font-ui text-[11px] text-foreground-muted">
            <Info className="h-3.5 w-3.5 shrink-0" />
            {ax(
              "স্বয়ংক্রিয় অনুবাদ চলে Chrome ১৩৮+ (ডেস্কটপ)-এ। ইংরেজি ঘরগুলো হাতে লিখতে হবে।",
            )}
          </span>
        ) : (
          <button
            type="button"
            onClick={runTranslation}
            disabled={busy || !hasBangla}
            title={
              hasBangla ? "" : ax("আগে বাংলায় শিরোনাম ও লেখা দিন")
            }
            className="flex items-center gap-2 rounded-lg border border-brand-crimson bg-background px-3 py-1.5 font-ui text-xs font-semibold text-brand-crimson hover:bg-brand-crimson hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-background disabled:hover:text-brand-crimson"
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Languages className="h-3.5 w-3.5" />
            )}
            {ax("বাংলা থেকে ইংরেজি করুন")}
          </button>
        )}

        {statusText() && (
          <span className="font-ui text-[11px] text-foreground-muted">
            {statusText()}
          </span>
        )}
        {availability === "downloadable" && !busy && (
          <span className="font-ui text-[11px] text-foreground-muted">
            {ax("প্রথমবার ভাষা প্যাক নামবে (একবারই)")}
          </span>
        )}
      </div>

      {error && (
        <p className="font-ui text-[11px] text-brand-crimson">{error}</p>
      )}

      {/* machine-translation warning — the review gate */}
      {lang === "en" && machineTranslated && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <div className="flex-1">
            <p className="font-ui text-[11px] font-semibold text-amber-900">
              {ax("এটি যন্ত্রে করা অনুবাদ — প্রকাশের আগে পড়ে দেখুন")}
            </p>
            <p className="mt-0.5 font-ui text-[11px] leading-relaxed text-amber-800">
              {ax(
                "বিশেষ করে নাম, সংখ্যা ও উদ্ধৃতি মিলিয়ে নিন। আটক/গ্রেপ্তার, অভিযুক্ত/দোষী — এই শব্দগুলো ঠিক আছে কি না দেখুন।",
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onConfirm}
            className="shrink-0 rounded-md border border-amber-400 px-2.5 py-1 font-ui text-[11px] font-semibold text-amber-900 hover:bg-amber-100"
          >
            {ax("দেখেছি")}
          </button>
        </div>
      )}
    </div>
  );
}
