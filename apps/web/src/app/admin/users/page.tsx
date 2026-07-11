"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/admin-api";
import { ConfirmModal } from "@/components/admin/Modal";
import { useAdminT, type AdminKey } from "@/lib/admin-i18n";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

const ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR", "REPORTER", "MODERATOR"];

const inputCls =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand-crimson focus:outline-none";

export default function UsersAdminPage() {
  const t = useAdminT();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "REPORTER" });
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () =>
    apiFetch<{ users: User[] }>("/api/admin/users")
      .then((d) => setUsers(d.users))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    setError(null);
    if (!form.name || !form.email || form.password.length < 6) {
      setError("নাম, ইমেইল ও কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন");
      return;
    }
    try {
      await apiFetch("/api/admin/users", { method: "POST", body: JSON.stringify(form) });
      setForm({ name: "", email: "", password: "", role: "REPORTER" });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  };

  const update = async (id: string, patch: Partial<User>) => {
    await apiFetch(`/api/admin/users/${id}`, { method: "PUT", body: JSON.stringify(patch) });
    load();
  };

  const remove = async (id: string) => {
    setError(null);
    try {
      await apiFetch(`/api/admin/users/${id}`, { method: "DELETE" });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-heading">{t("usersRoles")}</h1>

      {error && (
        <p className="mt-3 rounded-lg bg-brand-crimson/10 px-3.5 py-2 font-ui text-sm text-brand-crimson">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2 rounded-xl border border-border bg-background p-4">
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder={t("colName")}
          className={`${inputCls} flex-1`}
        />
        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder={t("colEmail")}
          className={`${inputCls} flex-1`}
        />
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder={t("userPassword")}
          className={inputCls}
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className={inputCls}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {t(`role${r}` as AdminKey)}
            </option>
          ))}
        </select>
        <button
          onClick={add}
          className="flex items-center gap-1.5 rounded-lg bg-brand-crimson px-4 py-2 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark"
        >
          <Plus className="h-4 w-4" />
          {t("addUser")}
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border font-ui text-xs uppercase tracking-wide text-foreground-muted/70">
            <tr>
              <th className="px-4 py-3">{t("colName")}</th>
              <th className="px-4 py-3">{t("colEmail")}</th>
              <th className="px-4 py-3">{t("colRole")}</th>
              <th className="px-4 py-3">{t("active")}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? null : (
              users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium text-foreground">{u.name}</td>
                  <td className="px-4 py-3 text-foreground-muted">{u.email}</td>
                  <td className="px-4 py-3">
                    <select
                      value={u.role}
                      onChange={(e) => update(u.id, { role: e.target.value })}
                      className={inputCls}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {t(`role${r}` as AdminKey)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={u.active}
                      onClick={() => update(u.id, { active: !u.active })}
                      className={`relative h-5 w-9 rounded-full transition-colors ${
                        u.active ? "bg-brand-crimson" : "bg-border"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                          u.active ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setDeleteId(u.id)}
                      className="rounded p-1.5 text-foreground-muted hover:bg-surface hover:text-brand-crimson"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {deleteId && (
        <ConfirmModal
          title={t("deleteTitle")}
          message={t("deleteMessage")}
          onConfirm={() => remove(deleteId)}
          onClose={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
