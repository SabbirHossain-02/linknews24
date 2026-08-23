"use client";

import { useCallback, useEffect, useState } from "react";
import { Phone, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/admin-api";
import { useAdminT, type AdminKey } from "@/lib/admin-i18n";
import {
  ReviewActions,
  StatusFilter,
  StatusPill,
  Submitter,
  type ListingStatus,
} from "@/components/admin/ListingReview";

interface Hospital {
  id: string;
  name: string;
  type: "GOVERNMENT" | "PRIVATE" | "SPECIALIZED" | "NGO";
  address: string;
  thana: string | null;
  hotline: string;
  emergency24: boolean;
  status: ListingStatus;
  reviewNote: string | null;
  district?: { name: string; slug: string } | null;
  account?: { name: string; email: string; avatar?: string | null } | null;
}

export default function AdminHospitalsPage() {
  const t = useAdminT();
  const [rows, setRows] = useState<Hospital[]>([]);
  const [status, setStatus] = useState<ListingStatus | "">("PENDING");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    const q = status ? `?status=${status}` : "";
    apiFetch<{ hospitals: Hospital[] }>(`/api/admin/hospitals${q}`)
      .then((d) => setRows(d.hospitals))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(load, [load]);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-heading">{t("hospitals")}</h1>
      <p className="mt-1 font-ui text-sm text-foreground-muted">
        {t("svcHospitalDesk")}
      </p>

      <div className="mt-5">
        <StatusFilter value={status} onChange={setStatus} />
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {loading ? null : rows.length === 0 ? (
          <p className="rounded-xl border border-border bg-background p-6 text-center font-ui text-sm text-foreground-muted">
            {status === "PENDING"
              ? t("svcNothingPending")
              : t("svcNoRecords")}
          </p>
        ) : (
          rows.map((h) => (
            <div
              key={h.id}
              className="flex flex-col gap-2 rounded-xl border border-border bg-background p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-heading">{h.name}</span>
                <span className="rounded bg-surface px-2 py-0.5 font-ui text-[11px] text-foreground-muted">
                  {t(("svcType" + h.type) as AdminKey)}
                </span>
                {h.emergency24 && (
                  <span className="rounded bg-brand-crimson/10 px-2 py-0.5 font-ui text-[11px] font-semibold text-brand-crimson">
                    {t("svcEmergency")}
                  </span>
                )}
                <StatusPill status={h.status} />
              </div>

              <p className="font-ui text-sm text-foreground-muted">
                {h.address}
                {h.thana ? `, ${h.thana}` : ""}
                {h.district ? ` — ${h.district.name}` : ""}
              </p>

              <p className="flex items-center gap-1.5 font-ui text-sm text-foreground">
                <Phone className="h-3.5 w-3.5 text-brand-crimson" />
                {h.hotline}
              </p>

              {h.reviewNote && (
                <p className="font-ui text-[11px] text-brand-crimson">
                  {t("svcReturnReason")}: {h.reviewNote}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2">
                <Submitter account={h.account} />
                <div className="flex items-center gap-2">
                  <ReviewActions
                    service="hospital"
                    id={h.id}
                    status={h.status}
                    onDone={load}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      await apiFetch(`/api/admin/hospitals/${h.id}`, {
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
