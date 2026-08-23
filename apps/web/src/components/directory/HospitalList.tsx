"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, MapPin, Phone, Siren } from "lucide-react";
import { API_BASE } from "@/lib/admin-api";
import { districts, formatPhone } from "@/lib/directory-data";
import { HOSPITAL_TYPES, type HospitalListing } from "@/lib/services-api";

/**
 * Hospital directory.
 *
 * Someone reaches this page in an emergency, so the hotline is the loudest
 * thing on each card and the 24/7 lines come first — the API already sorts
 * them that way.
 */
export function HospitalList() {
  const [rows, setRows] = useState<HospitalListing[]>([]);
  const [district, setDistrict] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const q = new URLSearchParams();
    if (district) q.set("district", district);
    if (type) q.set("type", type);

    fetch(`${API_BASE}/api/hospitals?${q}`)
      .then((r) => r.json())
      .then((d) => setRows(d.hospitals ?? []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [district, type]);

  useEffect(load, [load]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 font-ui text-sm text-foreground"
        >
          <option value="">সব জেলা</option>
          {districts.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.name}
            </option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 font-ui text-sm text-foreground"
        >
          <option value="">সব ধরন</option>
          {HOSPITAL_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="font-ui text-sm text-foreground-muted">লোড হচ্ছে…</p>
      ) : rows.length === 0 ? (
        <p className="rounded-xl border border-border bg-background p-8 text-center font-ui text-sm text-foreground-muted">
          এই শর্তে কোনো হাসপাতাল পাওয়া যায়নি।
        </p>
      ) : (
        rows.map((h) => (
          <article
            key={h.id}
            className="flex flex-wrap items-start gap-4 rounded-xl border border-border bg-background p-4 shadow-sm"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface text-brand-crimson">
              <Building2 className="h-5 w-5" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-bold text-heading">{h.name}</h2>
                <span className="rounded bg-surface px-2 py-0.5 font-ui text-[11px] text-foreground-muted">
                  {HOSPITAL_TYPES.find((t) => t.value === h.type)?.label ?? h.type}
                </span>
                {h.emergency24 && (
                  <span className="flex items-center gap-1 rounded bg-brand-crimson/10 px-2 py-0.5 font-ui text-[11px] font-semibold text-brand-crimson">
                    <Siren className="h-3 w-3" />
                    ২৪/৭ জরুরি
                  </span>
                )}
              </div>

              <p className="mt-1 flex items-start gap-1.5 font-ui text-sm text-foreground-muted">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  {h.address}
                  {h.thana ? `, ${h.thana}` : ""}
                  {h.district ? ` — ${h.district.name}` : ""}
                </span>
              </p>
            </div>

            <a
              href={`tel:${h.hotline}`}
              className="flex shrink-0 items-center gap-2 rounded-lg bg-brand-crimson px-4 py-2.5 font-ui text-sm font-bold text-white hover:bg-brand-crimson-dark"
            >
              <Phone className="h-4 w-4" />
              {formatPhone(h.hotline)}
            </a>
          </article>
        ))
      )}
    </div>
  );
}
