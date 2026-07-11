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
interface Group {
  slug: string;
  label: string;
}
interface Donor {
  id: string;
  name: string;
  group: string;
  phone: string;
  districtId: string;
  district: { name: string } | null;
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand-crimson focus:outline-none focus:ring-2 focus:ring-brand-crimson/15";

const EMPTY = { name: "", group: "", phone: "", districtId: "" };

export default function DonorsAdminPage() {
  const t = useAdminT();
  const [districts, setDistricts] = useState<District[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [filterGroup, setFilterGroup] = useState("");
  const [q, setQ] = useState("");
  const [donors, setDonors] = useState<Donor[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Donor | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  // Guards against out-of-order responses: only the newest request's result wins.
  const reqId = useRef(0);

  useEffect(() => {
    apiFetch<{ districts: District[] }>("/api/districts").then((d) => setDistricts(d.districts)).catch(() => {});
    apiFetch<{ groups: Group[] }>("/api/blood-groups").then((d) => setGroups(d.groups)).catch(() => {});
  }, []);

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (filterGroup) params.set("group", filterGroup);
    if (q) params.set("q", q);
    const id = ++reqId.current;
    apiFetch<{ donors: Donor[] }>(`/api/admin/donors?${params.toString()}`)
      .then((d) => {
        if (id === reqId.current) setDonors(d.donors);
      })
      .catch(() => {});
  }, [filterGroup, q]);

  useEffect(() => {
    const timer = setTimeout(load, q ? 350 : 0);
    return () => clearTimeout(timer);
  }, [load, q]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY, group: filterGroup || "" });
    setShowForm(true);
  };
  const openEdit = (d: Donor) => {
    setEditing(d);
    setForm({ name: d.name, group: d.group, phone: d.phone, districtId: d.districtId });
    setShowForm(true);
  };

  const submit = async () => {
    if (!form.name || !form.group || !form.phone || !form.districtId) return;
    if (editing) {
      await apiFetch(`/api/admin/donors/${editing.id}`, { method: "PUT", body: JSON.stringify(form) });
    } else {
      await apiFetch("/api/admin/donors", { method: "POST", body: JSON.stringify(form) });
    }
    setShowForm(false);
    load();
  };

  const remove = async (id: string) => {
    await apiFetch(`/api/admin/donors/${id}`, { method: "DELETE" });
    load();
  };

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-heading">{t("donors")}</h1>
        <button onClick={openAdd} className="flex items-center gap-1.5 rounded-lg bg-brand-crimson px-4 py-2.5 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark">
          <Plus className="h-4 w-4" />
          {t("addDonor")}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand-crimson focus:outline-none sm:w-40">
          <option value="">{t("selectGroup")}</option>
          {groups.map((g) => (<option key={g.slug} value={g.label}>{g.label}</option>))}
        </select>
        <div className="relative flex-1 min-w-[180px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("searchByName")} className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground focus:border-brand-crimson focus:outline-none" />
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-background">
        {donors.length === 0 ? (
          <p className="p-6 text-center font-ui text-sm text-foreground-muted">{t("noItems")}</p>
        ) : (
          <ul className="divide-y divide-border">
            {donors.map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="font-medium text-foreground">
                    {d.name}{" "}
                    <span className="ml-1 rounded bg-brand-crimson/10 px-1.5 py-0.5 font-ui text-xs font-semibold text-brand-crimson">{d.group}</span>
                  </p>
                  <p className="font-ui text-xs text-foreground-muted">
                    {d.phone} {d.district ? `· ${d.district.name}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button onClick={() => openEdit(d)} title={t("edit")} className="rounded p-1.5 text-foreground-muted hover:bg-surface hover:text-brand-crimson">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeleteId(d.id)} title={t("delete")} className="rounded p-1.5 text-foreground-muted hover:bg-surface hover:text-brand-crimson">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showForm && (
        <Modal title={editing ? t("edit") : t("addDonor")} onClose={() => setShowForm(false)}>
          <div className="flex flex-col gap-3">
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder={t("colName")} className={inputCls} />
            <div className="flex gap-3">
              <select value={form.group} onChange={(e) => set("group", e.target.value)} className={inputCls}>
                <option value="">{t("groupLabel")}</option>
                {groups.map((g) => (<option key={g.slug} value={g.label}>{g.label}</option>))}
              </select>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder={t("phoneLabel")} className={inputCls} />
            </div>
            <select value={form.districtId} onChange={(e) => set("districtId", e.target.value)} className={inputCls}>
              <option value="">{t("selectDistrict")}</option>
              {districts.map((d) => (<option key={d.id} value={d.id}>{d.name}</option>))}
            </select>
            <div className="mt-1 flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="rounded-lg border border-border px-4 py-2 font-ui text-sm text-foreground hover:bg-surface">{t("cancel")}</button>
              <button onClick={submit} className="rounded-lg bg-brand-crimson px-4 py-2 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark">{t("save")}</button>
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
