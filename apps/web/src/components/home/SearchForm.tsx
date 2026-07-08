"use client";

import { Search } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

export function SearchForm({ defaultValue }: { defaultValue?: string }) {
  const { t } = useLocale();

  return (
    <form action="/search" method="get" className="flex gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
        <input
          type="text"
          name="q"
          defaultValue={defaultValue}
          placeholder={t("searchPlaceholder")}
          autoFocus
          className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand-crimson focus:outline-none"
        />
      </div>
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-brand-navy px-5 py-2.5 font-ui text-sm font-medium text-white transition-colors hover:bg-brand-navy-soft"
      >
        {t("searchButton")}
      </button>
    </form>
  );
}
