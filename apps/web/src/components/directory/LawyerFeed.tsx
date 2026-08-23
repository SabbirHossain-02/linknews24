"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { BadgeCheck, MapPin, Phone, Scale, User } from "lucide-react";
import { API_BASE } from "@/lib/admin-api";
import { districts, formatPhone } from "@/lib/directory-data";
import { bnDate, type LawyerListing } from "@/lib/services-api";
import { useLocale } from "@/components/providers/LocaleProvider";
import { localizedName } from "@/lib/i18n";

/**
 * Legal-service directory.
 *
 * A feed of profile cards, filtered on the page, rather than a menu of 64
 * districts that made you pick before seeing anyone. Only listings an editor
 * has approved reach here; the Bar Council enrolment number is shown because
 * it is the thing that makes the listing checkable.
 */
export function LawyerFeed() {
  const { locale, t } = useLocale();
  const [rows, setRows] = useState<LawyerListing[]>([]);
  const [district, setDistrict] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const url = district
      ? `${API_BASE}/api/lawyers/${district}`
      : `${API_BASE}/api/lawyers`;

    fetch(url)
      .then((r) => r.json())
      .then((d) => setRows(d.lawyers ?? []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [district]);

  useEffect(load, [load]);

  const term = q.trim().toLowerCase();
  const shown = term
    ? rows.filter(
        (l) =>
          l.name.toLowerCase().includes(term) ||
          (l.spec ?? "").toLowerCase().includes(term),
      )
    : rows;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 font-ui text-sm text-foreground"
        >
          <option value="">{t("svcAllDistricts")}</option>
          {districts.map((d) => (
            <option key={d.slug} value={d.slug}>
              {localizedName(d, locale)}
            </option>
          ))}
        </select>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("svcSearchName")}
          className="min-w-[200px] flex-1 rounded-lg border border-border bg-background px-3 py-2 font-ui text-sm text-foreground"
        />
      </div>

      {loading ? (
        <p className="font-ui text-sm text-foreground-muted">{t("svcLoading")}</p>
      ) : shown.length === 0 ? (
        <div className="rounded-xl border border-border bg-background p-10 text-center">
          <Scale className="mx-auto h-8 w-8 text-foreground-muted/40" />
          <p className="mt-3 font-ui text-sm text-foreground-muted">
            {t("svcNoResults")}
          </p>
          <p className="mt-1 font-ui text-xs text-foreground-muted">
            {t("svcNoLawyersHint")}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((l) => (
          <article
            key={l.id}
            className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 shadow-sm"
          >
            {l.photo ? (
              <Image
                src={l.photo}
                alt={l.name}
                width={52}
                height={52}
                className="h-[52px] w-[52px] shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-surface text-foreground-muted">
                <User className="h-6 w-6" />
              </span>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold text-heading">{l.name}</h2>
                {l.barEnrollNo && (
                  <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 font-ui text-[11px] font-semibold text-green-800">
                    <BadgeCheck className="h-3 w-3" />
                    {t("svcBarEnrolment")} {l.barEnrollNo}
                  </span>
                )}
              </div>

              <p className="mt-0.5 font-ui text-sm text-foreground-muted">
                {l.spec}
                {l.barAssociation ? ` · ${l.barAssociation}` : ""}
              </p>

              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-ui text-xs text-foreground-muted">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {l.district
                    ? localizedName(
                        { name: l.district.name, nameEn: l.district.nameEn ?? l.district.name },
                        locale,
                      )
                    : "—"}
                </span>
                {l.enrolledOn && (
                  <span>{t("svcEnrolledOn")}: {bnDate(l.enrolledOn)}</span>
                )}
              </p>

              {l.chamber && (
                <p className="mt-1 font-ui text-sm text-foreground-muted">
                  {t("svcChamber")}: {l.chamber}
                </p>
              )}
            </div>

            <a
              href={`tel:${l.phone}`}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-brand-crimson px-4 py-2.5 font-ui text-sm font-bold text-white hover:bg-brand-crimson-dark"
            >
              <Phone className="h-4 w-4" />
              {formatPhone(l.phone)}
            </a>
          </article>
          ))}
        </div>
      )}
    </div>
  );
}
