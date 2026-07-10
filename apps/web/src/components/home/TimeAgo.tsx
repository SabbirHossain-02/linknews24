"use client";

import { relativeTime } from "@/lib/i18n";
import { useLocale } from "@/components/providers/LocaleProvider";

// Shows a live "relative time" (e.g. "৩ ঘণ্টা আগে") from an ISO date.
export function TimeAgo({ iso }: { iso: string }) {
  const { locale } = useLocale();
  // suppressHydrationWarning: server/client "now" can differ by seconds.
  return <span suppressHydrationWarning>{relativeTime(iso, locale)}</span>;
}
