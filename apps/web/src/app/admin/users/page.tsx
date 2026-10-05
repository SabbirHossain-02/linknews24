"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { KeyRound, Plus, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/admin-api";
import { ConfirmModal } from "@/components/admin/Modal";
import { Toggle } from "@/components/admin/Toggle";
import { useAdminT, type AdminKey } from "@/lib/admin-i18n";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { LoginActivity } from "@/components/admin/LoginActivity";
import { useAdminText } from "@/lib/admin-strings";
import { UserPermissionsModal } from "@/components/admin/UserPermissionsModal";
import { getSocket } from "@/lib/socket";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  avatar?: string | null;
  online?: boolean;
  lastSeenAt?: string | null;
  /** How many modules this person has their own exception for. */
  customPermissions?: number;
}

/** "5 min ago" style, for the last-seen line. */
function seen(iso: string | null | undefined, ax: (s: string) => string) {
  if (!iso) return ax("কখনো আসেননি");
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return ax("এইমাত্র");
  if (min < 60) return `${min} ${ax("মিনিট আগে")}`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} ${ax("ঘণ্টা আগে")}`;
  return `${Math.floor(hr / 24)} ${ax("দিন আগে")}`;
}

const ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR", "REPORTER", "MODERATOR"];

const inputCls =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand-crimson focus:outline-none";

export default function UsersAdminPage() {
  const ax = useAdminText();
  const t = useAdminT();
  const { user: me } = useAdminAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "REPORTER" });
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [permsFor, setPermsFor] = useState<string | null>(null);

  const load = () =>
    apiFetch<{ users: User[] }>("/api/admin/users")
      .then((d) => setUsers(d.users))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    // Online dots follow people arriving and leaving.
    const socket = getSocket();
    socket.on("presence:update", load);
    return () => {
      socket.off("presence:update", load);
    };
  }, []);

  const add = async () => {
    setError(null);
    if (!form.name || !form.email || form.password.length < 8) {
      setError(ax("নাম, সঠিক ইমেইল ও কমপক্ষে ৮ অক্ষরের পাসওয়ার্ড দিন"));
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

  // Applied on screen first — see the note on the articles list.
  const update = async (id: string, patch: Partial<User>) => {
    const before = users;
    setUsers((list) => list.map((u) => (u.id === id ? { ...u, ...patch } : u)));
    try {
      await apiFetch(`/api/admin/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(patch),
      });
    } catch (e) {
      setUsers(before);
      setError(e instanceof Error ? e.message : "Error");
    }
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

  if (me && me.role !== "SUPER_ADMIN")
    return (
      <p className="font-ui text-sm text-foreground-muted">{t("rolesDenied")}</p>
    );

  return (
    <div className="max-w-5xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-heading">{t("usersRoles")}</h1>
        <Link
          href="/admin/roles"
          className="rounded-lg border border-border px-3.5 py-2 font-ui text-sm font-semibold text-foreground hover:bg-surface"
        >
          {t("rolesNav")}
        </Link>
      </div>

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
              <th className="px-4 py-3">{ax("অনুমতি")}</th>
              <th className="px-4 py-3">{t("active")}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? null : (
              users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="relative shrink-0">
                        {u.avatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={u.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-navy font-ui text-xs font-bold text-white">
                            {u.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${
                            u.online ? "bg-green-500" : "bg-foreground-muted/30"
                          }`}
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-medium text-foreground">{u.name}</span>
                        <span className="block font-ui text-[11px] text-foreground-muted">
                          {u.online ? (
                            <span className="font-semibold text-green-600">{ax("অনলাইনে")}</span>
                          ) : (
                            seen(u.lastSeenAt, ax)
                          )}
                        </span>
                      </span>
                    </div>
                  </td>
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
                    {u.role === "SUPER_ADMIN" ? (
                      <span className="font-ui text-xs text-foreground-muted">{ax("সব অনুমতি")}</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPermsFor(u.id)}
                        className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 font-ui text-xs font-semibold text-foreground hover:border-brand-crimson hover:text-brand-crimson"
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                        {ax("অনুমতি")}
                        {!!u.customPermissions && (
                          <span className="rounded-full bg-amber-100 px-1.5 font-ui text-[10px] font-bold text-amber-700">
                            {u.customPermissions} {ax("কাস্টম")}
                          </span>
                        )}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Toggle
                      checked={u.active}
                      onChange={(next) => update(u.id, { active: next })}
                      title={t("active")}
                    />
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

      <LoginActivity />

      {permsFor && (
        <UserPermissionsModal
          userId={permsFor}
          onClose={() => setPermsFor(null)}
          onChanged={load}
        />
      )}

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
