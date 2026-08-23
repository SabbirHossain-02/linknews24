"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Droplet, Heart, Search, Trash2 } from "lucide-react";
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

interface Donation {
  id: string;
  donatedOn: string;
  place: string | null;
  verified: boolean;
}

interface Donor {
  id: string;
  name: string;
  donorNo: string | null;
  group: string;
  phone: string;
  gender: string | null;
  dob: string | null;
  address: string | null;
  photo: string | null;
  lastDonation: string | null;
  status: ListingStatus;
  reviewNote: string | null;
  district: { name: string } | null;
  account?: { name: string; email: string; avatar?: string | null } | null;
  donations?: Donation[];
  _count?: { likes: number };
}

/**
 * Blood-service review desk.
 *
 * A list, not a feed: an editor is working through a queue here, so the rows
 * stay compact and the donation dates — the evidence the public badge rests on
 * — are visible without opening anything.
 */
export default function DonorsAdminPage() {
  const t = useAdminT();
  const [rows, setRows] = useState<Donor[]>([]);
  const [status, setStatus] = useState<ListingStatus | "">("PENDING");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q.trim()) params.set("q", q.trim());

    apiFetch<{ donors: Donor[] }>(`/api/admin/donors?${params}`)
      .then((d) => setRows(d.donors))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [status, q]);

  useEffect(() => {
    const timer = setTimeout(load, 250);
    return () => clearTimeout(timer);
  }, [load]);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-heading">{t("donors")}</h1>
      <p className="mt-1 font-ui text-sm text-foreground-muted">
        {t("svcBloodDesk")}
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
          rows.map((d) => (
            <div
              key={d.id}
              className="rounded-xl border border-border bg-background p-4"
            >
              <div className="flex flex-wrap items-start gap-3">
                {d.photo ? (
                  <Image
                    src={d.photo}
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-foreground-muted">
                    <Droplet className="h-4 w-4" />
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-heading">{d.name}</span>
                    <span className="rounded bg-brand-crimson px-2 py-0.5 font-ui text-[11px] font-bold text-white">
                      {d.group}
                    </span>
                    <StatusPill status={d.status} />
                    {(d._count?.likes ?? 0) > 0 && (
                      <span className="flex items-center gap-1 font-ui text-[11px] text-foreground-muted">
                        <Heart className="h-3 w-3" />
                        {d._count?.likes}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 font-ui text-xs text-foreground-muted">
                    {d.phone}
                    {d.district ? ` · ${d.district.name}` : ""}
                    {d.donorNo ? ` · ${t("svcDonorId")} ${d.donorNo}` : ""}
                    {d.dob ? ` · ${t("svcBorn")} ${bnDate(d.dob)}` : ""}
                  </p>
                  {d.address && (
                    <p className="mt-0.5 font-ui text-xs text-foreground-muted">
                      {d.address}
                    </p>
                  )}

                  {/* The dated entries the public badge is computed from. */}
                  {(d.donations ?? []).length > 0 && (
                    <p className="mt-1.5 font-ui text-[11px] text-foreground-muted">
                      {t("svcDonations")}:{" "}
                      {(d.donations ?? [])
                        .map((x) => bnDate(x.donatedOn))
                        .join(" · ")}
                    </p>
                  )}

                  {d.reviewNote && (
                    <p className="mt-1 font-ui text-[11px] text-brand-crimson">
                      {t("svcReturnReason")}: {d.reviewNote}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2">
                <Submitter account={d.account} />
                <div className="flex items-center gap-2">
                  <ReviewActions
                    service="donor"
                    id={d.id}
                    status={d.status}
                    onDone={load}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      await apiFetch(`/api/admin/donors/${d.id}`, {
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
