"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/admin-api";
import { ConfirmModal } from "@/components/admin/Modal";
import { useAdminT } from "@/lib/admin-i18n";

interface District {
  id: string;
  name: string;
}
interface Lawyer {
  id: string;
  name: string;
  spec: string;
  phone: string;
  chamber: string | null;
  district: { name: string } | null;
}

const inputCls =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand-crimson focus:outline-none";

export default function LawyersAdminPage() {
  const t = useAdminT();
  const [districts, setDistricts] = useState<District[]>([]);
  const [districtId, setDistrictId] = useState("");
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [form, setForm] = useState({ name: "", spec: "", phone: "", chamber: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ districts: District[] }>("/api/districts")
      .then((d) => setDistricts(d.districts))
      .catch(() => {});
  }, []);

  const load = useCallback(() => {
    const q = districtId ? `?district=${districtId}` : "";
    apiFetch<{ lawyers: Lawyer[] }>(`/api/admin/lawyers${q}`)
      .then((d) => setLawyers(d.lawyers))
      .catch(() => {});
  }, [districtId]);

  useEffect(() => {
    load();
  }, [load]);

  const add = async () => {
    if (!districtId || !form.name || !form.phone) return;
    await apiFetch("/api/admin/lawyers", {
      method: "POST",
      body: JSON.stringify({ ...form, districtId }),
    });
    setForm({ name: "", spec: "", phone: "", chamber: "" });
    load();
  };

  const remove = async (id: string) => {
    await apiFetch(`/api/admin/lawyers/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-heading">{t("lawyers")}</h1>

      <div className="mt-4">
        <select
          value={districtId}
          onChange={(e) => setDistrictId(e.target.value)}
          className={`${inputCls} w-full sm:w-64`}
        >
          <option value="">{t("selectDistrict")}</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {districtId && (
        <div className="mt-3 flex flex-wrap gap-2 rounded-xl border border-border bg-background p-4">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("colName")} className={`${inputCls} flex-1`} />
          <input value={form.spec} onChange={(e) => setForm({ ...form, spec: e.target.value })} placeholder={t("specLabel")} className={inputCls} />
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={t("phoneLabel")} className={inputCls} />
          <input value={form.chamber} onChange={(e) => setForm({ ...form, chamber: e.target.value })} placeholder={t("chamberLabel")} className={inputCls} />
          <button onClick={add} className="flex items-center gap-1.5 rounded-lg bg-brand-crimson px-4 py-2 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark">
            <Plus className="h-4 w-4" />
            {t("addLawyer")}
          </button>
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-background">
        {lawyers.length === 0 ? (
          <p className="p-6 text-center font-ui text-sm text-foreground-muted">{t("noItems")}</p>
        ) : (
          <ul className="divide-y divide-border">
            {lawyers.map((l) => (
              <li key={l.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{l.name}</p>
                  <p className="font-ui text-xs text-foreground-muted">
                    {l.spec} · {l.phone} {l.district ? `· ${l.district.name}` : ""}
                  </p>
                </div>
                <button onClick={() => setDeleteId(l.id)} className="text-foreground-muted hover:text-brand-crimson">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {deleteId && (
        <ConfirmModal title={t("deleteTitle")} message={t("deleteMessage")} onConfirm={() => remove(deleteId)} onClose={() => setDeleteId(null)} />
      )}
    </div>
  );
}
