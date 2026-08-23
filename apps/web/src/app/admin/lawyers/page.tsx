"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Scale, Search, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/admin-api";
import {
  ReviewActions,
  StatusFilter,
  StatusPill,
  Submitter,
  type ListingStatus,
} from "@/components/admin/ListingReview";
import { bnDate } from "@/lib/services-api";
import { useAdminT } from "@/lib/admin-i18n";

interface Lawyer {
  id: string;
  name: string;
  spec: string;
  phone: string;
  chamber: string | null;
  photo: string | null;
  barEnrollNo: string | null;
  enrolledOn: string | null;
  sanadUrl: string | null;
  barAssociation: string | null;
  barMemberId: string | null;
  status: ListingStatus;
  reviewNote: string | null;
  district: { name: string } | null;
  account?: { name: string; email: string; avatar?: string | null } | null;
}

/**
 * Legal-service review desk.
 *
 * The Bar Council fields are the whole point of the review, so they sit on the
 * row rather than behind a click — an editor approving a listing has to be
 * able to check the enrolment number against the uploaded sanad.
 */
export default function LawyersAdminPage() {
  const t = useAdminT();
  const [rows, setRows] = useState<Lawyer[]>([]);
  const [status, setStatus] = useState<ListingStatus | "">("PENDING");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q.trim()) params.set("q", q.trim());

    apiFetch<{ lawyers: Lawyer[] }>(`/api/admin/lawyers?${params}`)
      .then((d) => setRows(d.lawyers))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [status, q]);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-heading">{t("lawyers")}</h1>
      <p className="mt-1 font-ui text-sm text-foreground-muted">
        {t("svcLegalDesk")}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <StatusFilter value={status} onChange={setStatus} />
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("svcSearchName")}
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground focus:border-brand-crimson focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {loading ? null : rows.length === 0 ? (
          <p className="rounded-xl border border-border bg-background p-8 text-center font-ui text-sm text-foreground-muted">
            {status === "PENDING" ? t("svcNothingPending") : t("svcNoRecords")}
          </p>
        ) : (
          rows.map((l) => (
            <div
              key={l.id}
              className="rounded-xl border border-border bg-background p-4"
            >
              <div className="flex flex-wrap items-start gap-3">
                {l.photo ? (
                  <Image
                    src={l.photo}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-foreground-muted">
                    <Scale className="h-4 w-4" />
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-heading">{l.name}</span>
                    <StatusPill status={l.status} />
                  </div>

                  <p className="mt-1 font-ui text-xs text-foreground-muted">
                    {l.spec}
                    {l.district ? ` · ${l.district.name}` : ""} · {l.phone}
                  </p>

                  {/* Credentials — what the reviewer is actually checking. */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-ui text-[11px] text-foreground">
                    {l.barEnrollNo && (
                      <span className="rounded bg-surface px-2 py-0.5">
                        {t("svcEnrolment")}: <b>{l.barEnrollNo}</b>
                      </span>
                    )}
                    {l.enrolledOn && <span>{t("svcDate")}: {bnDate(l.enrolledOn)}</span>}
                    {l.barAssociation && <span>{l.barAssociation}</span>}
                    {l.barMemberId && <span>{t("svcMemberId")}: {l.barMemberId}</span>}
                    {l.sanadUrl ? (
                      <a
                        href={l.sanadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-brand-crimson underline"
                      >
                        {t("svcViewSanad")}
                      </a>
                    ) : (
                      <span className="text-amber-700">{t("svcNoSanad")}</span>
                    )}
                  </div>

                  {l.chamber && (
                    <p className="mt-1 font-ui text-xs text-foreground-muted">
                      {t("svcChamberLbl")}: {l.chamber}
                    </p>
                  )}
                  {l.reviewNote && (
                    <p className="mt-1 font-ui text-[11px] text-brand-crimson">
                      {t("svcReturnReason")}: {l.reviewNote}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2">
                <Submitter account={l.account} />
                <div className="flex items-center gap-2">
                  <ReviewActions
                    service="lawyer"
                    id={l.id}
                    status={l.status}
                    onDone={load}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      await apiFetch(`/api/admin/lawyers/${l.id}`, {
                        method: "DELETE",
                      });
                      load();
                    }}
                    title={t("delete")}
                    className="rounded p-1.5 text-foreground-muted hover:bg-surface hover:text-brand-crimson"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
