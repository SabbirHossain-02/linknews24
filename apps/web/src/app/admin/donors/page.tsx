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
  const [donors, setDonors] = useState<Donor[]>([]);
  const [form, setForm] = useState({ name: "", group: "", phone: "", districtId: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ districts: District[] }>("/api/districts")
      .then((d) => setDistricts(d.districts))
      .catch(() => {});
    apiFetch<{ groups: Group[] }>("/api/blood-groups")
      .then((d) => setGroups(d.groups))
      .catch(() => {});
  }, []);

  const load = useCallback(() => {
    const q = filterGroup ? `?group=${encodeURIComponent(filterGroup)}` : "";
    apiFetch<{ donors: Donor[] }>(`/api/admin/donors${q}`)
      .then((d) => setDonors(d.donors))
      .catch(() => {});
  }, [filterGroup]);

  useEffect(() => {
    load();
  }, [load]);

  const add = async () => {
    if (!form.name || !form.group || !form.phone || !form.districtId) return;
    await apiFetch("/api/admin/donors", { method: "POST", body: JSON.stringify(form) });
    setForm({ name: "", group: "", phone: "", districtId: "" });
    load();
  };

  const remove = async (id: string) => {
    await apiFetch(`/api/admin/donors/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-heading">{t("donors")}</h1>

      <div className="mt-4">
        <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)} className={`${inputCls} w-full sm:w-48`}>
          <option value="">{t("selectGroup")}</option>
          {groups.map((g) => (
            <option key={g.slug} value={g.label}>
              {g.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 rounded-xl border border-border bg-background p-4">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("colName")} className={`${inputCls} flex-1`} />
        <select value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} className={inputCls}>
          <option value="">{t("groupLabel")}</option>
          {groups.map((g) => (
            <option key={g.slug} value={g.label}>
              {g.label}
            </option>
          ))}
        </select>
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={t("phoneLabel")} className={inputCls} />
        <select value={form.districtId} onChange={(e) => setForm({ ...form, districtId: e.target.value })} className={inputCls}>
          <option value="">{t("districtCol")}</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <button onClick={add} className="flex items-center gap-1.5 rounded-lg bg-brand-crimson px-4 py-2 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark">
          <Plus className="h-4 w-4" />
          {t("addDonor")}
        </button>
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
                    <span className="ml-1 rounded bg-brand-crimson/10 px-1.5 py-0.5 font-ui text-xs font-semibold text-brand-crimson">
                      {d.group}
                    </span>
                  </p>
                  <p className="font-ui text-xs text-foreground-muted">
                    {d.phone} {d.district ? `· ${d.district.name}` : ""}
                  </p>
                </div>
                <button onClick={() => setDeleteId(d.id)} className="text-foreground-muted hover:text-brand-crimson">
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
