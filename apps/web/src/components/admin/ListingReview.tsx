"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, X } from "lucide-react";
import { apiFetch } from "@/lib/admin-api";
import { useAdminT, type AdminKey } from "@/lib/admin-i18n";

export type ListingStatus = "PENDING" | "APPROVED" | "REJECTED";

const STATUS_KEY: Record<ListingStatus, AdminKey> = {
  PENDING: "svcPending",
  APPROVED: "svcApproved",
  REJECTED: "svcRejected",
};

export function StatusPill({ status }: { status: ListingStatus }) {
  const t = useAdminT();
  const tone =
    status === "APPROVED"
      ? "bg-green-100 text-green-800"
      : status === "REJECTED"
        ? "bg-brand-crimson/10 text-brand-crimson"
        : "bg-amber-100 text-amber-800";
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 font-ui text-[11px] font-semibold ${tone}`}
    >
      {t(STATUS_KEY[status])}
    </span>
  );
}

/** The person who submitted a listing, so a reviewer knows who to trust. */
export function Submitter({
  account,
}: {
  account?: { name: string; email: string; avatar?: string | null } | null;
}) {
  const t = useAdminT();
  if (!account)
    return (
      <span className="font-ui text-[11px] text-foreground-muted">
        {t("svcSubmittedBy")}
      </span>
    );
  return (
    <span className="flex items-center gap-1.5 font-ui text-[11px] text-foreground-muted">
      {account.avatar && (
        <Image
          src={account.avatar}
          alt=""
          width={18}
          height={18}
          className="h-[18px] w-[18px] rounded-full object-cover"
        />
      )}
      {account.name} · {account.email}
    </span>
  );
}

/**
 * Approve / reject controls for one submitted listing.
 *
 * Rejecting asks for a reason before it will send: the reader sees the note on
 * their dashboard, and "sent back" with no explanation tells them nothing
 * about what to fix.
 */
export function ReviewActions({
  service,
  id,
  status,
  onDone,
}: {
  service: "lawyer" | "donor" | "hospital";
  id: string;
  status: ListingStatus;
  onDone: () => void;
}) {
  const t = useAdminT();
  const [rejecting, setRejecting] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const review = async (next: ListingStatus, reviewNote?: string) => {
    setBusy(true);
    try {
      await apiFetch(`/api/admin/listings/${service}/${id}/review`, {
        method: "PUT",
        body: JSON.stringify({ status: next, reviewNote: reviewNote ?? null }),
      });
      setRejecting(false);
      setNote("");
      onDone();
    } finally {
      setBusy(false);
    }
  };

  if (rejecting)
    return (
      <div className="flex w-full flex-wrap items-center gap-2">
        <input
          autoFocus
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t("svcRejectReason")}
          className="min-w-[220px] flex-1 rounded-lg border border-border bg-background px-3 py-1.5 font-ui text-xs text-foreground focus:border-brand-crimson focus:outline-none"
        />
        <button
          type="button"
          disabled={!note.trim() || busy}
          onClick={() => review("REJECTED", note.trim())}
          className="rounded-lg bg-brand-crimson px-3 py-1.5 font-ui text-xs font-semibold text-white disabled:opacity-40"
        >
          {t("svcSendBack")}
        </button>
        <button
          type="button"
          onClick={() => setRejecting(false)}
          className="rounded-lg border border-border px-3 py-1.5 font-ui text-xs text-foreground"
        >
          {t("cancel")}
        </button>
      </div>
    );

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {status !== "APPROVED" && (
        <button
          type="button"
          disabled={busy}
          onClick={() => review("APPROVED")}
          className="flex items-center gap-1 rounded-lg border border-green-300 bg-green-50 px-2.5 py-1.5 font-ui text-xs font-semibold text-green-800 hover:bg-green-100 disabled:opacity-50"
        >
          <Check className="h-3.5 w-3.5" />
          {t("svcApprove")}
        </button>
      )}
      {status !== "REJECTED" && (
        <button
          type="button"
          disabled={busy}
          onClick={() => setRejecting(true)}
          className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 font-ui text-xs text-foreground-muted hover:border-brand-crimson hover:text-brand-crimson disabled:opacity-50"
        >
          <X className="h-3.5 w-3.5" />
          {t("svcReject")}
        </button>
      )}
    </div>
  );
}

/** Row of status filters shared by the three review pages. */
export function StatusFilter({
  value,
  onChange,
}: {
  value: ListingStatus | "";
  onChange: (v: ListingStatus | "") => void;
}) {
  const t = useAdminT();
  const tabs: { value: ListingStatus | ""; key: AdminKey }[] = [
    { value: "PENDING", key: "svcPending" },
    { value: "APPROVED", key: "svcApproved" },
    { value: "REJECTED", key: "svcRejected" },
    { value: "", key: "svcAll" },
  ];

  return (
    <div className="flex flex-wrap gap-1.5">
      {tabs.map((tab) => (
        <button
          key={tab.value || "all"}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`rounded-lg px-3 py-1.5 font-ui text-xs font-medium transition-colors ${
            value === tab.value
              ? "bg-brand-crimson text-white"
              : "border border-border text-foreground-muted hover:text-foreground"
          }`}
        >
          {t(tab.key)}
        </button>
      ))}
    </div>
  );
}
