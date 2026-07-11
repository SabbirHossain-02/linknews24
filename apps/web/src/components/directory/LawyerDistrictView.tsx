"use client";

import Link from "next/link";
import { ArrowLeft, Phone, Scale } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { toLocaleDigits } from "@/lib/i18n";
import { formatPhone } from "@/lib/directory-data";
import type { ApiLawyer } from "@/lib/api";

export function LawyerDistrictView({
  districtBn,
  districtEn,
  lawyers,
}: {
  districtBn: string;
  districtEn: string;
  lawyers: ApiLawyer[];
}) {
  const { locale, t } = useLocale();
  const district = locale === "en" ? districtEn : districtBn;
  const heading =
    locale === "en" ? `Lawyers in ${district}` : `${district} জেলার আইনজীবী`;

  return (
    <>
      <Link
        href="/lawyers"
        className="inline-flex items-center gap-1.5 font-ui text-sm text-foreground-muted transition-colors hover:text-brand-crimson"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("allDistricts")}
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-heading sm:text-3xl">
        {heading}
      </h1>
      <p className="mt-1 font-ui text-sm text-foreground-muted">
        {toLocaleDigits(lawyers.length, locale)} {t("lawyersCount")}
      </p>
      <p className="mt-3 rounded-lg bg-surface px-3.5 py-2 font-ui text-xs text-foreground-muted">
        {t("directoryDisclaimer")}
      </p>

      <ul className="mt-5 flex flex-col gap-3">
        {lawyers.map((lawyer, i) => (
          <li
            key={i}
            className="flex items-center gap-4 rounded-xl border border-border bg-background p-4 shadow-sm"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-crimson/10 text-brand-crimson">
              <Scale className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">
                {locale === "en" ? `Adv. ${lawyer.name}` : `অ্যাডভোকেট ${lawyer.name}`}
              </p>
              <span className="font-ui text-xs text-foreground-muted">
                {locale === "en" ? lawyer.specEn || lawyer.spec : lawyer.spec}
              </span>
            </div>
            <a
              href={`tel:+88${lawyer.phone}`}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-brand-crimson px-3 py-2 font-ui text-sm font-medium text-white transition-colors hover:bg-brand-crimson-dark"
            >
              <Phone className="h-4 w-4" />
              <span className="hidden tabular-nums sm:inline">
                {toLocaleDigits(formatPhone(lawyer.phone), locale)}
              </span>
              <span className="sm:hidden">{t("callNow")}</span>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
