"use client";

import { SearchAutocomplete } from "./SearchAutocomplete";
import { useLocale } from "@/components/providers/LocaleProvider";

export function SearchForm({ defaultValue }: { defaultValue?: string }) {
  const { t } = useLocale();

  return (
    <form action="/search" method="get" className="flex gap-2">
      <SearchAutocomplete defaultValue={defaultValue} placeholder={t("searchPlaceholder")} autoFocus />
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-brand-navy px-5 py-2.5 font-ui text-sm font-medium text-white transition-colors hover:bg-brand-navy-soft"
      >
        {t("searchButton")}
      </button>
    </form>
  );
}
