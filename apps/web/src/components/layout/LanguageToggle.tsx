"use client";

import { useLocale } from "@/components/providers/LocaleProvider";

export function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <button
      onClick={() => setLocale(locale === "bn" ? "en" : "bn")}
      className="font-ui text-xs font-semibold transition-colors hover:text-white"
      aria-label="ভাষা পরিবর্তন করুন"
    >
      {locale === "bn" ? "EN" : "বাং"}
    </button>
  );
}
