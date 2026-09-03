"use client";

import { Clock } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { publishStamp } from "@/lib/i18n";

/**
 * A minute's grace before an edit counts as one.
 *
 * Saving twice while filing a story is not news; a correction an hour later is.
 */
const WORTH_MENTIONING_MS = 60_000;

/**
 * When a story went out, and when it was last changed.
 *
 * A relative "1 day ago" stood here before, which is fine on a list of
 * headlines but not on the story itself — a reader checking how fresh a report
 * is, or citing it, needs the date and the hour.
 */
export function PublishStamp({
  publishedAt,
  editedAt,
  className = "",
}: {
  publishedAt: string;
  editedAt?: string | null;
  className?: string;
}) {
  const { locale, t } = useLocale();
  if (!publishedAt) return null;

  const published = publishStamp(publishedAt, locale);
  if (!published) return null;

  const gap = editedAt
    ? new Date(editedAt).getTime() - new Date(publishedAt).getTime()
    : 0;
  const edited =
    editedAt && gap > WORTH_MENTIONING_MS ? publishStamp(editedAt, locale) : null;

  return (
    <p
      className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 font-ui text-xs text-foreground-muted ${className}`}
    >
      <Clock className="h-3.5 w-3.5 shrink-0" />
      <span>
        {t("articlePublished")}: {published}
      </span>
      {edited && (
        <span className="border-l border-border pl-2">
          {t("articleUpdated")}: {edited}
        </span>
      )}
    </p>
  );
}
