"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/admin-api";
import { ConfirmModal, Modal } from "@/components/admin/Modal";
import { useAdminT } from "@/lib/admin-i18n";

interface District {
  id: string;
  name: string;
}
interface Lawyer {
  id: string;
  name: string;
  spec: string;
  specEn: string;
  phone: string;
  chamber: string | null;
  districtId: string;
  district: { name: string } | null;
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand-crimson focus:outline-none focus:ring-2 focus:ring-brand-crimson/15";

const EMPTY = { name: "", spec: "", specEn: "", phone: "", chamber: "", districtId: "" };

export default function LawyersAdminPage() {
  const t = useAdminT();
  const [districts, setDistricts] = useState<District[]>([]);
  const [districtId, setDistrictId] = useState("");
  const [q, setQ] = useState("");
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Lawyer | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  // Guards against out-of-order responses: only the newest request's result wins.
  const reqId = useRef(0);

  useEffect(() => {
    apiFetch<{ districts: District[] }>("/api/districts")
      .then((d) => setDistricts(d.districts))
      .catch(() => {});
  }, []);

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (districtId) params.set("district", districtId);
    if (q) params.set("q", q);
    const id = ++reqId.current;
    apiFetch<{ lawyers: Lawyer[] }>(`/api/admin/lawyers?${params.toString()}`)
      .then((d) => {
        if (id === reqId.current) setLawyers(d.lawyers);
      })
      .catch(() => {});
  }, [districtId, q]);

  useEffect(() => {
    const timer = setTimeout(load, q ? 350 : 0);
    return () => clearTimeout(timer);
  }, [load, q]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY, districtId: districtId || "" });
    setShowForm(true);
  };
  const openEdit = (l: Lawyer) => {
    setEditing(l);
    setForm({
      name: l.name,
      spec: l.spec,
      specEn: l.specEn ?? "",
      phone: l.phone,
      chamber: l.chamber ?? "",
      districtId: l.districtId,
    });
    setShowForm(true);
  };

  const submit = async () => {
    if (!form.name || !form.phone || !form.districtId) return;
    if (editing) {
      await apiFetch(`/api/admin/lawyers/${editing.id}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
    } else {
      await apiFetch("/api/admin/lawyers", {
        method: "POST",
        body: JSON.stringify(form),
      });
    }
    setShowForm(false);
    load();
  };

  const remove = async (id: string) => {
    await apiFetch(`/api/admin/lawyers/${id}`, { method: "DELETE" });
    load();
  };

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-heading">{t("lawyers")}</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-lg bg-brand-crimson px-4 py-2.5 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark"
        >
          <Plus className="h-4 w-4" />
          {t("addLawyer")}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <select
          value={districtId}
          onChange={(e) => setDistrictId(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand-crimson focus:outline-none sm:w-56"
        >
          <option value="">{t("selectDistrict")}</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <div className="relative flex-1 min-w-[180px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("searchByName")}
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground focus:border-brand-crimson focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-background">
        {lawyers.length === 0 ? (
          <p className="p-6 text-center font-ui text-sm text-foreground-muted">
            {t("noItems")}
          </p>
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
                <div className="flex shrink-0 items-center gap-1">
                  <button onClick={() => openEdit(l)} title={t("edit")} className="rounded p-1.5 text-foreground-muted hover:bg-surface hover:text-brand-crimson">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeleteId(l.id)} title={t("delete")} className="rounded p-1.5 text-foreground-muted hover:bg-surface hover:text-brand-crimson">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showForm && (
        <Modal title={editing ? t("edit") : t("addLawyer")} onClose={() => setShowForm(false)}>
          <div className="flex flex-col gap-3">
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder={t("colName")} className={inputCls} />
            <div className="flex gap-3">
              <input value={form.spec} onChange={(e) => set("spec", e.target.value)} placeholder={t("specLabel")} className={inputCls} />
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder={t("phoneLabel")} className={inputCls} />
            </div>
            <input value={form.chamber} onChange={(e) => set("chamber", e.target.value)} placeholder={t("chamberLabel")} className={inputCls} />
            <select value={form.districtId} onChange={(e) => set("districtId", e.target.value)} className={inputCls}>
              <option value="">{t("selectDistrict")}</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <div className="mt-1 flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 font-ui text-sm text-foreground hover:bg-surface">
                {t("cancel")}
              </button>
              <button onClick={submit} className="rounded-lg bg-brand-crimson px-4 py-2 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark">
                {t("save")}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {deleteId && (
        <ConfirmModal title={t("deleteTitle")} message={t("deleteMessage")} onConfirm={() => remove(deleteId)} onClose={() => setDeleteId(null)} />
      )}
    </div>
  );
}
