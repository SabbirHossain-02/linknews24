"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/admin-api";
import { ConfirmModal } from "@/components/admin/Modal";
import { useAdminT } from "@/lib/admin-i18n";

interface District {
  id: string;
  name: string;
}
interface Group {
  slug: string;
  label: string;
}
interface Donor {
  id: string;
  name: string;
  group: string;
  phone: string;
  district: { name: string } | null;
}

const inputCls =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand-crimson focus:outline-none";

export default function DonorsAdminPage() {
  const t = useAdminT();
  const [districts, setDistricts] = useState<District[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [filterGroup, setFilterGroup] = useState("");
  const [q, setQ] = useState("");
  const [donors, setDonors] = useState<Donor[]>([]);
  const [form, setForm] = useState({ name: "", group: "", phone: "", districtId: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ districts: District[] }>("/api/districts").then((d) => setDistricts(d.districts)).catch(() => {});
    apiFetch<{ groups: Group[] }>("/api/blood-groups").then((d) => setGroups(d.groups)).catch(() => {});
  }, []);

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (filterGroup) params.set("group", filterGroup);
    if (q) params.set("q", q);
    apiFetch<{ donors: Donor[] }>(`/api/admin/donors?${params.toString()}`)
      .then((d) => setDonors(d.donors))
      .catch(() => {});
  }, [filterGroup, q]);

  useEffect(() => {
    const timer = setTimeout(load, q ? 350 : 0);
    return () => clearTimeout(timer);
  }, [load, q]);

  const add = async () => {
    if (!form.name || !form.group || !form.phone || !form.districtId) return;
    await apiFetch("/api/admin/donors", { method: "POST", body: JSON.stringify(form) });
    setForm({ name: "", group: "", phone: "", districtId: "" });
    load();
  };

  const update = async (id: string, patch: Partial<Donor>) => {
    await apiFetch(`/api/admin/donors/${id}`, { method: "PUT", body: JSON.stringify(patch) });
  };

  const remove = async (id: string) => {
    await apiFetch(`/api/admin/donors/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-heading">{t("donors")}</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)} className={`${inputCls} w-full sm:w-40`}>
          <option value="">{t("selectGroup")}</option>
          {groups.map((g) => (
            <option key={g.slug} value={g.label}>{g.label}</option>
          ))}
        </select>
        <div className="relative flex-1 min-w-[180px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("searchByName")} className={`${inputCls} w-full pl-9`} />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 rounded-xl border border-border bg-background p-4">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("colName")} className={`${inputCls} flex-1`} />
        <select value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} className={inputCls}>
          <option value="">{t("groupLabel")}</option>
          {groups.map((g) => (<option key={g.slug} value={g.label}>{g.label}</option>))}
        </select>
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={t("phoneLabel")} className={inputCls} />
        <select value={form.districtId} onChange={(e) => setForm({ ...form, districtId: e.target.value })} className={inputCls}>
          <option value="">{t("districtCol")}</option>
          {districts.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
        </select>
        <button onClick={add} className="flex items-center gap-1.5 rounded-lg bg-brand-crimson px-4 py-2 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark">
          <Plus className="h-4 w-4" />
          {t("addDonor")}
        </button>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {donors.length === 0 ? (
          <p className="rounded-xl border border-border bg-background p-6 text-center font-ui text-sm text-foreground-muted">{t("noItems")}</p>
        ) : (
          donors.map((d) => (
            <div key={d.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-background p-3">
              <input defaultValue={d.name} onBlur={(e) => e.target.value !== d.name && update(d.id, { name: e.target.value })} className={`${inputCls} flex-1 min-w-[140px]`} />
              <select defaultValue={d.group} onChange={(e) => update(d.id, { group: e.target.value })} className={`${inputCls} w-20`}>
                {groups.map((g) => (<option key={g.slug} value={g.label}>{g.label}</option>))}
              </select>
              <input defaultValue={d.phone} onBlur={(e) => e.target.value !== d.phone && update(d.id, { phone: e.target.value })} className={`${inputCls} w-32`} />
              <span className="font-ui text-xs text-foreground-muted">{d.district?.name}</span>
              <button onClick={() => setDeleteId(d.id)} className="shrink-0 text-foreground-muted hover:text-brand-crimson">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {deleteId && (
        <ConfirmModal title={t("deleteTitle")} message={t("deleteMessage")} onConfirm={() => remove(deleteId)} onClose={() => setDeleteId(null)} />
      )}
    </div>
  );
}
