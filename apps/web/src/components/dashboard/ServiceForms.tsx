"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CheckCircle2, Clock, Plus, Trash2, Upload, XCircle } from "lucide-react";
import { districts, bloodGroups } from "@/lib/directory-data";
import { uploadFile } from "@/lib/admin-api";
import {
  HOSPITAL_TYPES,
  addDonation,
  bnDate,
  getMyListings,
  removeDonation,
  submitDonor,
  submitHospital,
  submitLawyer,
  type DonorListing,
  type HospitalListing,
  type LawyerListing,
  type ListingStatus,
  type MyListings,
} from "@/lib/services-api";
import { useLocale } from "@/components/providers/LocaleProvider";
import { localizedName, type TranslationKey } from "@/lib/i18n";

const input =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand-crimson focus:outline-none";
const label = "font-ui text-xs font-semibold text-foreground-muted";

/** Where the listing stands with the review desk. */
const STATUS_KEY: Record<ListingStatus, TranslationKey> = {
  PENDING: "fStatusPending",
  APPROVED: "fStatusApproved",
  REJECTED: "fStatusRejected",
};

function StatusBanner({
  status,
  note,
}: {
  status: ListingStatus;
  note?: string | null;
}) {
  const { t } = useLocale();
  const tone =
    status === "APPROVED"
      ? { bg: "bg-green-50", border: "border-green-300", text: "text-green-800", Icon: CheckCircle2 }
      : status === "REJECTED"
        ? { bg: "bg-brand-crimson/5", border: "border-brand-crimson/40", text: "text-brand-crimson", Icon: XCircle }
        : { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-800", Icon: Clock };

  return (
    <div className={`flex items-start gap-2 rounded-lg border ${tone.border} ${tone.bg} px-3 py-2.5`}>
      <tone.Icon className={`mt-0.5 h-4 w-4 shrink-0 ${tone.text}`} />
      <div>
        <p className={`font-ui text-xs font-semibold ${tone.text}`}>
          {t(STATUS_KEY[status])}
        </p>
        {status === "PENDING" && (
          <p className="mt-0.5 font-ui text-[11px] text-foreground-muted">
            {t("fPendingNote")}
          </p>
        )}
        {note && (
          <p className="mt-0.5 font-ui text-[11px] text-foreground-muted">
            {t("fEditorNote")}: {note}
          </p>
        )}
      </div>
    </div>
  );
}

function Field({
  label: text,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className={label}>{text}</label>
      <div className="mt-1">{children}</div>
      {hint && (
        <p className="mt-1 font-ui text-[11px] text-foreground-muted">{hint}</p>
      )}
    </div>
  );
}

function SubmitBar({
  busy,
  error,
  saved,
  label: text,
}: {
  busy: boolean;
  error: string | null;
  saved: boolean;
  label: string;
}) {
  const { t } = useLocale();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-brand-crimson px-5 py-2.5 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark disabled:opacity-60"
      >
        {busy ? t("fSubmitting") : text}
      </button>
      {saved && (
        <span className="font-ui text-xs text-green-700">
          {t("fSubmitted")}
        </span>
      )}
      {error && (
        <span className="font-ui text-xs text-brand-crimson">{error}</span>
      )}
    </div>
  );
}

/** Shared submit plumbing: busy flag, error, "saved" flash, reload. */
function useSubmit(reload: () => void) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await fn();
      setSaved(true);
      reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  return { busy, error, saved, run };
}

/* -------------------------------------------------------------- lawyers */

export function LawyerServiceForm({
  listing,
  reload,
}: {
  listing: LawyerListing | null;
  reload: () => void;
}) {
  const { t, locale } = useLocale();
  const { busy, error, saved, run } = useSubmit(reload);
  const [sanad, setSanad] = useState(listing?.sanadUrl ?? "");
  const [uploading, setUploading] = useState(false);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        run(() =>
          submitLawyer({
            name: f.get("name"),
            spec: f.get("spec"),
            phone: f.get("phone"),
            district: f.get("district"),
            chamber: f.get("chamber") || undefined,
            barEnrollNo: f.get("barEnrollNo"),
            enrolledOn: f.get("enrolledOn") || undefined,
            barAssociation: f.get("barAssociation") || undefined,
            barMemberId: f.get("barMemberId") || undefined,
            sanadUrl: sanad || undefined,
          }),
        );
      }}
    >
      <div>
        <h2 className="text-lg font-bold text-heading">{t("dashLegal")}</h2>
        <p className="mt-1 font-ui text-sm text-foreground-muted">
          {t("fLegalIntro")}
        </p>
      </div>

      {listing && <StatusBanner status={listing.status} note={listing.reviewNote} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("fFullName")}>
          <input name="name" required defaultValue={listing?.name} className={input} />
        </Field>
        <Field label={t("fMobile")}>
          <input name="phone" required defaultValue={listing?.phone} className={input} />
        </Field>
        <Field label={t("fBarEnrolNo")}>
          <input
            name="barEnrollMissing"
            hidden
            readOnly
            value=""
            aria-hidden
          />
          <input
            name="barEnrollNo"
            required
            defaultValue={listing?.barEnrollNo ?? ""}
            className={input}
          />
        </Field>
        <Field label={t("fEnrolDate")}>
          <input
            name="enrolledOn"
            type="date"
            defaultValue={listing?.enrolledOn?.slice(0, 10) ?? ""}
            className={input}
          />
        </Field>
        <Field label={t("fBarAssoc")}>
          <input
            name="barAssociation"
            defaultValue={listing?.barAssociation ?? ""}
            className={input}
          />
        </Field>
        <Field label={t("fBarMemberId")}>
          <input
            name="barMemberId"
            defaultValue={listing?.barMemberId ?? ""}
            className={input}
          />
        </Field>
        <Field label={t("fSpeciality")}>
          <input
            name="spec"
            required
            defaultValue={listing?.spec}
            placeholder={t("fSpecialityPh")}
            className={input}
          />
        </Field>
        <Field label={t("fDistrict")}>
          <select
            name="district"
            required
            defaultValue={listing?.district?.slug ?? ""}
            className={input}
          >
            <option value="">{t("fPickDistrict")}</option>
            {districts.map((d) => (
              <option key={d.slug} value={d.slug}>
                {localizedName(d, locale)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label={t("fChamberAddr")}>
        <input name="chamber" defaultValue={listing?.chamber ?? ""} className={input} />
      </Field>

      <Field
        label={t("fSanad")}
        hint={t("fSanadHint")}
      >
        <div className="flex flex-wrap items-center gap-3">
          <label
            className={`flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3.5 py-2.5 font-ui text-sm text-foreground hover:bg-surface ${
              uploading ? "pointer-events-none opacity-60" : ""
            }`}
          >
            <Upload className="h-4 w-4" />
            {uploading ? t("fUploading") : t("fUploadSanad")}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                setUploading(true);
                try {
                  setSanad(await uploadFile(file));
                } finally {
                  setUploading(false);
                }
              }}
            />
          </label>
          {sanad && (
            <a
              href={sanad}
              target="_blank"
              rel="noreferrer"
              className="font-ui text-xs text-brand-crimson underline"
            >
              {t("fViewSanad")}
            </a>
          )}
        </div>
      </Field>

      <SubmitBar busy={busy} error={error} saved={saved} label={t("fSubmit")} />
    </form>
  );
}

/* --------------------------------------------------------------- donors */

export function DonorServiceForm({
  listing,
  reload,
}: {
  listing: DonorListing | null;
  reload: () => void;
}) {
  const { t, locale } = useLocale();
  const { busy, error, saved, run } = useSubmit(reload);
  const [donationDate, setDonationDate] = useState("");
  const [donationPlace, setDonationPlace] = useState("");
  const [logError, setLogError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          run(() =>
            submitDonor({
              name: f.get("name"),
              donorNo: f.get("donorNo") || undefined,
              dob: f.get("dob") || undefined,
              gender: f.get("gender") || undefined,
              group: f.get("group"),
              phone: f.get("phone"),
              address: f.get("address") || undefined,
              district: f.get("district"),
              lastDonation: f.get("lastDonation") || undefined,
            }),
          );
        }}
      >
        <div>
          <h2 className="text-lg font-bold text-heading">{t("dashBlood")}</h2>
          <p className="mt-1 font-ui text-sm text-foreground-muted">
            {t("fBloodIntro")}
          </p>
        </div>

        {listing && (
          <StatusBanner status={listing.status} note={listing.reviewNote} />
        )}

        {listing?.badge && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface px-3.5 py-3">
            <span
              className="rounded-full px-3 py-1 font-ui text-xs font-bold text-white"
              style={{ background: listing.badge.color }}
            >
              {locale === "en" ? listing.badge.labelEn : listing.badge.label}
            </span>
            <span className="font-ui text-xs text-foreground-muted">
              {listing.eligibleNow
                ? t("svcEligibleNow")
                : `${t("svcNextDonation")}: ${bnDate(listing.nextEligible)}`}
            </span>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("fFullName")}>
            <input name="name" required defaultValue={listing?.name} className={input} />
          </Field>
          <Field label={t("fDonorNo")}>
            <input name="donorNo" defaultValue={listing?.donorNo ?? ""} className={input} />
          </Field>
          <Field label={t("fDob")}>
            <input
              name="dob"
              type="date"
              defaultValue={listing?.dob?.slice(0, 10) ?? ""}
              className={input}
            />
          </Field>
          <Field label={t("fGender")}>
            <select name="gender" defaultValue={listing?.gender ?? ""} className={input}>
              <option value="">{t("fPick")}</option>
              <option value="male">{t("svcMale")}</option>
              <option value="female">{t("svcFemale")}</option>
              <option value="other">{t("svcOther")}</option>
            </select>
          </Field>
          <Field label={t("fBloodGroup")}>
            <select
              name="group"
              required
              defaultValue={listing?.group ?? ""}
              className={input}
            >
              <option value="">{t("fPick")}</option>
              {bloodGroups.map((g) => (
                <option key={g.slug} value={g.label}>
                  {g.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("fMobile")}>
            <input name="phone" required defaultValue={listing?.phone} className={input} />
          </Field>
          <Field label={t("fDistrict")}>
            <select
              name="district"
              required
              defaultValue={listing?.district?.slug ?? ""}
              className={input}
            >
              <option value="">{t("fPickDistrict")}</option>
              {districts.map((d) => (
                <option key={d.slug} value={d.slug}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("fLastDonation")}>
            <input
              name="lastDonation"
              type="date"
              defaultValue={listing?.lastDonation?.slice(0, 10) ?? ""}
              className={input}
            />
          </Field>
        </div>

        <Field label={t("fAddress")}>
          <input name="address" defaultValue={listing?.address ?? ""} className={input} />
        </Field>

        <SubmitBar busy={busy} error={error} saved={saved} label={t("fSubmit")} />
      </form>

      {/* Donation log — the badge is built from these dated entries. */}
      {listing && (
        <div className="rounded-xl border border-border bg-background p-4">
          <h3 className="font-ui text-sm font-bold text-heading">
            {t("fDonationLog")}
          </h3>
          <p className="mt-1 font-ui text-xs text-foreground-muted">
            {t("fDonationLogHint")}
          </p>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="date"
              value={donationDate}
              onChange={(e) => setDonationDate(e.target.value)}
              className={input}
            />
            <input
              value={donationPlace}
              onChange={(e) => setDonationPlace(e.target.value)}
              placeholder={t("fWherePh")}
              className={input}
            />
            <button
              type="button"
              disabled={!donationDate}
              onClick={async () => {
                setLogError(null);
                try {
                  await addDonation(donationDate, donationPlace || undefined);
                  setDonationDate("");
                  setDonationPlace("");
                  reload();
                } catch (e) {
                  setLogError(e instanceof Error ? e.message : t("fCannotAdd"));
                }
              }}
              className="flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-brand-crimson px-4 py-2.5 font-ui text-sm font-semibold text-brand-crimson hover:bg-brand-crimson hover:text-white disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
              {t("fAdd")}
            </button>
          </div>
          {logError && (
            <p className="mt-2 font-ui text-xs text-brand-crimson">{logError}</p>
          )}

          <ul className="mt-3 flex flex-col divide-y divide-border">
            {(listing.donations ?? []).length === 0 ? (
              <li className="py-2 font-ui text-xs text-foreground-muted">
                {t("fNoRecords")}
              </li>
            ) : (
              (listing.donations ?? []).map((d) => (
                <li key={d.id} className="flex items-center gap-3 py-2">
                  <span className="font-ui text-sm text-foreground">
                    {bnDate(d.donatedOn)}
                  </span>
                  {d.place && (
                    <span className="font-ui text-xs text-foreground-muted">
                      {d.place}
                    </span>
                  )}
                  {d.verified && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 font-ui text-[10px] font-semibold text-green-800">
                      {t("fVerified")}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      await removeDonation(d.id);
                      reload();
                    }}
                    className="ml-auto rounded p-1 text-foreground-muted hover:text-brand-crimson"
                    title="মুছুন"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------ hospitals */

export function HospitalServiceForm({
  listing,
  reload,
}: {
  listing: HospitalListing | null;
  reload: () => void;
}) {
  const { t, locale } = useLocale();
  const { busy, error, saved, run } = useSubmit(reload);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        run(() =>
          submitHospital({
            name: f.get("name"),
            type: f.get("type"),
            address: f.get("address"),
            district: f.get("district"),
            thana: f.get("thana") || undefined,
            hotline: f.get("hotline"),
            emergency24: f.get("emergency24") === "on",
          }),
        );
      }}
    >
      <div>
        <h2 className="text-lg font-bold text-heading">{t("dashHospital")}</h2>
        <p className="mt-1 font-ui text-sm text-foreground-muted">
          {t("fHospitalIntro")}
        </p>
      </div>

      {listing && <StatusBanner status={listing.status} note={listing.reviewNote} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("fHospitalName")}>
          <input name="name" required defaultValue={listing?.name} className={input} />
        </Field>
        <Field label={t("fHospitalType")}>
          <select name="type" required defaultValue={listing?.type ?? ""} className={input}>
            <option value="">{t("fPick")}</option>
            {HOSPITAL_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("fDistrict")}>
          <select
            name="district"
            required
            defaultValue={listing?.district?.slug ?? ""}
            className={input}
          >
            <option value="">{t("fPickDistrict")}</option>
            {districts.map((d) => (
              <option key={d.slug} value={d.slug}>
                {localizedName(d, locale)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={t("fThana")}>
          <input name="thana" defaultValue={listing?.thana ?? ""} className={input} />
        </Field>
        <Field label={t("fHotline")}>
          <input name="hotline" required defaultValue={listing?.hotline} className={input} />
        </Field>
      </div>

      <Field label={t("fFullAddress")}>
        <input name="address" required defaultValue={listing?.address} className={input} />
      </Field>

      <label className="flex cursor-pointer items-center gap-2 font-ui text-sm text-foreground">
        <input
          name="emergency24"
          type="checkbox"
          defaultChecked={listing?.emergency24}
          className="accent-brand-crimson"
        />
        {t("fEmergency24")}
      </label>

      <SubmitBar busy={busy} error={error} saved={saved} label={t("fSubmit")} />
    </form>
  );
}

/* ------------------------------------------------------------ container */

/**
 * Loads the reader's three listings once and hands each form its own. Sharing
 * one fetch keeps the dashboard from firing three requests every time a tab
 * changes.
 */
export function ServicePanel({
  service,
}: {
  service: "lawyer" | "donor" | "hospital";
}) {
  const { t } = useLocale();
  const [data, setData] = useState<MyListings | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    getMyListings()
      .then(setData)
      .catch(() => setData({ lawyer: null, donor: null, hospital: null }))
      .finally(() => setLoading(false));
  };

  useEffect(reload, []);

  if (loading)
    return (
      <p className="font-ui text-sm text-foreground-muted">{t("svcLoading")}</p>
    );

  const photo =
    data?.lawyer?.photo ?? data?.donor?.photo ?? data?.hospital?.photo ?? null;

  return (
    <div className="flex flex-col gap-4">
      {photo && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3.5 py-3">
          <Image
            src={photo}
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 rounded-full object-cover"
          />
          <p className="font-ui text-xs text-foreground-muted">
            {t("fPhotoNote")}
          </p>
        </div>
      )}

      {service === "lawyer" && (
        <LawyerServiceForm listing={data?.lawyer ?? null} reload={reload} />
      )}
      {service === "donor" && (
        <DonorServiceForm listing={data?.donor ?? null} reload={reload} />
      )}
      {service === "hospital" && (
        <HospitalServiceForm listing={data?.hospital ?? null} reload={reload} />
      )}
    </div>
  );
}
