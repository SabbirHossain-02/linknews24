"use client";

import { useLocale } from "@/components/providers/LocaleProvider";

/**
 * What the homepage says before anything has been published.
 *
 * A small client component because the page itself is rendered on the server,
 * where the reader's chosen language is not known — the locale lives in the
 * browser. Without this the empty state was Bengali in both views.
 */
export function EmptyHome() {
  const { t } = useLocale();

  return (
    <>
      <h1 className="text-2xl font-bold text-heading">{t("homeEmptyTitle")}</h1>
      <p className="font-ui text-sm text-foreground-muted">{t("homeEmptyBody")}</p>
    </>
  );
}
