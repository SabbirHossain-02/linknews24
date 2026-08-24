"use client";

import { useLocale } from "@/components/providers/LocaleProvider";

export function LanguageToggle() {
  const { locale, setLocale, t } = useLocale();

  return (
    <button
      onClick={() => setLocale(locale === "bn" ? "en" : "bn")}
      className="font-ui text-xs font-semibold transition-colors hover:text-white"
      aria-label={t("changeLanguage")}
    >
      {locale === "bn" ? "English" : "বাংলা"}
    </button>
  );
}
