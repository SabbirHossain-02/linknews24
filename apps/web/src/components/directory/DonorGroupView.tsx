"use client";

import Link from "next/link";
import { ArrowLeft, Droplet, MapPin, Phone } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { toLocaleDigits } from "@/lib/i18n";
import { formatPhone } from "@/lib/directory-data";
import type { ApiDonor } from "@/lib/api";

function monthsAgo(iso: string | null): number {
  if (!iso) return 0;
  const diff = Date.now() - new Date(iso).getTime();
  return Math.max(Math.floor(diff / (30 * 24 * 60 * 60 * 1000)), 0);
}

export function DonorGroupView({
  group,
  donors,
}: {
  group: string;
  donors: ApiDonor[];
}) {
  const { locale, t } = useLocale();
  const heading =
    locale === "en"
      ? `${group} blood donors`
      : `${group} গ্রুপের রক্তদাতা`;

  return (
    <>
      <Link
        href="/blood"
        className="inline-flex items-center gap-1.5 font-ui text-sm text-foreground-muted transition-colors hover:text-brand-crimson"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("allGroups")}
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-crimson text-lg font-bold text-white">
          {group}
        </span>
        <div>
          <h1 className="text-2xl font-bold text-heading sm:text-3xl">
            {heading}
          </h1>
          <p className="font-ui text-sm text-foreground-muted">
            {toLocaleDigits(donors.length, locale)} {t("donorsCount")}
          </p>
        </div>
      </div>

      <p className="mt-3 rounded-lg bg-surface px-3.5 py-2 font-ui text-xs text-foreground-muted">
        {t("directoryDisclaimer")}
      </p>

      <ul className="mt-5 flex flex-col gap-3">
        {donors.map((donor, i) => (
          <li
            key={i}
            className="flex items-center gap-4 rounded-xl border border-border bg-background p-4 shadow-sm"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-crimson/10 text-brand-crimson">
              <Droplet className="h-5 w-5" fill="currentColor" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">
                {donor.name}
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 font-ui text-xs text-foreground-muted">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {locale === "en"
                    ? donor.district?.nameEn
                    : donor.district?.name}
                </span>
                <span>
                  {t("lastDonationLabel")}:{" "}
                  {toLocaleDigits(monthsAgo(donor.lastDonation), locale)}{" "}
                  {t("monthsAgo")}
                </span>
              </div>
            </div>
            <a
              href={`tel:+88${donor.phone}`}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-brand-crimson px-3 py-2 font-ui text-sm font-medium text-white transition-colors hover:bg-brand-crimson-dark"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden tabular-nums sm:inline">
                {toLocaleDigits(formatPhone(donor.phone), locale)}
              </span>
              <span className="sm:hidden">{t("callNow")}</span>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
