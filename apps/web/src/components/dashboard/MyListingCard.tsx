"use client";

import { useState } from "react";
import Image from "next/image";
import {
  BadgeCheck,
  Building2,
  Droplet,
  MapPin,
  Pencil,
  Phone,
  Scale,
  Siren,
  Trash2,
  User,
} from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { localizedName, type TranslationKey } from "@/lib/i18n";
import { formatPhone } from "@/lib/directory-data";
import {
  bnDate,
  deleteMyListing,
  type DonorListing,
  type HospitalListing,
  type LawyerListing,
} from "@/lib/services-api";

/**
 * A submitted listing shown the way it reads on the site — as a card, not the
 * form that made it. Once something is filed, the form is the exception: what
 * a reader wants first is to see what they published and, if need be, change
 * or withdraw it.
 */
export function MyListingCard({
  service,
  lawyer,
  donor,
  hospital,
  onEdit,
  onDeleted,
  statusBanner,
}: {
  service: "lawyer" | "donor" | "hospital";
  lawyer?: LawyerListing | null;
  donor?: DonorListing | null;
  hospital?: HospitalListing | null;
  onEdit: () => void;
  onDeleted: () => void;
  statusBanner: React.ReactNode;
}) {
  const { locale, t } = useLocale();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    try {
      await deleteMyListing(service);
      onDeleted();
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  };

  const districtName = (d?: { name: string; nameEn?: string } | null) =>
    d ? localizedName({ name: d.name, nameEn: d.nameEn ?? d.name }, locale) : "—";

  return (
    <div className="flex flex-col gap-4">
      {statusBanner}

      <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
        {/* ---------------- lawyer ---------------- */}
        {service === "lawyer" && lawyer && (
          <div className="flex flex-wrap items-start gap-4">
            {lawyer.photo ? (
              <Image
                src={lawyer.photo}
                alt=""
                width={52}
                height={52}
                className="h-[52px] w-[52px] shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-surface text-foreground-muted">
                <Scale className="h-6 w-6" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-heading">{lawyer.name}</h3>
                {lawyer.barEnrollNo && (
                  <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 font-ui text-[11px] font-semibold text-green-800">
                    <BadgeCheck className="h-3 w-3" />
                    {t("svcBarEnrolment")} {lawyer.barEnrollNo}
                  </span>
                )}
              </div>
              <p className="mt-0.5 font-ui text-sm text-foreground-muted">
                {lawyer.spec}
                {lawyer.barAssociation ? ` · ${lawyer.barAssociation}` : ""}
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-ui text-xs text-foreground-muted">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {districtName(lawyer.district)}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {formatPhone(lawyer.phone)}
                </span>
              </p>
              {lawyer.chamber && (
                <p className="mt-1 font-ui text-sm text-foreground-muted">
                  {t("svcChamber")}: {lawyer.chamber}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ---------------- donor ---------------- */}
        {service === "donor" && donor && (
          <div className="flex flex-wrap items-start gap-4">
            {donor.photo ? (
              <Image
                src={donor.photo}
                alt=""
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
                <h3 className="font-bold text-heading">{donor.name}</h3>
                <span className="flex items-center gap-1 rounded bg-brand-crimson px-2 py-0.5 font-ui text-[11px] font-bold text-white">
                  <Droplet className="h-3 w-3" />
                  {donor.group}
                </span>
                {donor.badge && (
                  <span
                    className="rounded-full px-2.5 py-0.5 font-ui text-[11px] font-bold text-white"
                    style={{ background: donor.badge.color }}
                  >
                    {locale === "en" ? donor.badge.labelEn : donor.badge.label}
                  </span>
                )}
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-ui text-xs text-foreground-muted">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {districtName(donor.district)}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  {formatPhone(donor.phone)}
                </span>
              </p>
              <p className="mt-1.5 font-ui text-xs">
                {donor.eligibleNow ? (
                  <span className="rounded bg-green-50 px-2 py-1 font-semibold text-green-800">
                    {t("svcEligibleNow")}
                  </span>
                ) : (
                  <span className="rounded bg-amber-50 px-2 py-1 font-semibold text-amber-800">
                    {t("svcNextDonation")}: {bnDate(donor.nextEligible)}
                  </span>
                )}
              </p>
              {donor.address && (
                <p className="mt-1.5 font-ui text-sm text-foreground-muted">
                  {donor.address}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ---------------- hospital ---------------- */}
        {service === "hospital" && hospital && (
          <div className="flex flex-wrap items-start gap-4">
            <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-lg bg-surface text-brand-crimson">
              <Building2 className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-heading">{hospital.name}</h3>
                <span className="rounded bg-surface px-2 py-0.5 font-ui text-[11px] text-foreground-muted">
                  {t(`svcType${hospital.type}` as TranslationKey)}
                </span>
                {hospital.emergency24 && (
                  <span className="flex items-center gap-1 rounded bg-brand-crimson/10 px-2 py-0.5 font-ui text-[11px] font-semibold text-brand-crimson">
                    <Siren className="h-3 w-3" />
                    {t("svcEmergency24")}
                  </span>
                )}
              </div>
              <p className="mt-1 font-ui text-sm text-foreground-muted">
                {hospital.address}
                {hospital.thana ? `, ${hospital.thana}` : ""} —{" "}
                {districtName(hospital.district)}
              </p>
              <p className="mt-1 flex items-center gap-1 font-ui text-sm font-semibold text-brand-crimson">
                <Phone className="h-3.5 w-3.5" />
                {formatPhone(hospital.hotline)}
              </p>
            </div>
          </div>
        )}

        {/* ---------------- actions ---------------- */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 font-ui text-sm font-medium text-foreground hover:bg-surface"
          >
            <Pencil className="h-4 w-4" />
            {t("fEdit")}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 font-ui text-sm font-medium text-foreground-muted hover:border-brand-crimson hover:text-brand-crimson"
          >
            <Trash2 className="h-4 w-4" />
            {t("fDelete")}
          </button>
          <span className="font-ui text-[11px] text-foreground-muted">
            {t("fEditNote")}
          </span>
        </div>

        {confirming && (
          <div className="mt-3 rounded-lg border border-brand-crimson/40 bg-brand-crimson/5 p-3">
            <p className="font-ui text-sm font-semibold text-brand-crimson">
              {t("fDeleteTitle")}
            </p>
            <p className="mt-0.5 font-ui text-xs text-foreground-muted">
              {t("fDeleteBody")}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={remove}
                className="rounded-lg bg-brand-crimson px-4 py-2 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark disabled:opacity-60"
              >
                {busy ? t("fDeleting") : t("fDelete")}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-lg border border-border px-4 py-2 font-ui text-sm text-foreground hover:bg-surface"
              >
                {t("fCancelEdit")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
