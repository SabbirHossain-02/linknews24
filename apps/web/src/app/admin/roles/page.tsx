"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Crown, RotateCcw, ShieldCheck, Users, Zap } from "lucide-react";
import { apiFetch } from "@/lib/admin-api";
import { getSocket } from "@/lib/socket";
import {
  useAdminAuth,
  type Module,
  type Perm,
  type PermAction,
  type PermSet,
} from "@/components/admin/AdminAuthProvider";
import {
  PermissionMatrix,
  countModules,
  type ModuleInfo,
} from "@/components/admin/PermissionMatrix";
import { ConfirmModal } from "@/components/admin/Modal";
import { useAdminT, type AdminKey } from "@/lib/admin-i18n";
import { useAdminText } from "@/lib/admin-strings";

interface Matrix {
  modules: ModuleInfo[];
  roles: string[];
  matrix: Record<string, PermSet>;
  defaults: Record<string, PermSet>;
  userCounts: Record<string, number>;
}

/**
 * Who may do what — set here by the Super Admin, one role at a time.
 *
 * Every switch saves the moment it is flipped and is enforced by the API at
 * once; everyone with that role sees their sidebar change without reloading.
 * A single person's exceptions are set from the Users page.
 */
export default function RolesAdminPage() {
  const t = useAdminT();
  const ax = useAdminText();
  const { isSuper } = useAdminAuth();
  const [data, setData] = useState<Matrix | null>(null);
  const [role, setRole] = useState("EDITOR");
  const [busy, setBusy] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const load = useCallback(
    () =>
      apiFetch<Matrix>("/api/admin/permissions")
        .then(setData)
        .catch((e) => setError(e.message)),
    [],
  );

  useEffect(() => {
    if (!isSuper) return;
    load();
    // Another Super Admin editing at the same time — keep this view honest.
    const socket = getSocket();
    socket.on("permissions:changed", load);
    return () => {
      socket.off("permissions:changed", load);
    };
  }, [isSuper, load]);

  useEffect(() => {
    if (!saved) return;
    const id = setTimeout(() => setSaved(false), 1800);
    return () => clearTimeout(id);
  }, [saved]);

  const send = async (changes: (Perm & { module: Module; changed?: PermAction })[]) => {
    if (!data) return;
    setError(null);
    // Shown at once; put back if the server refuses.
    const before = data;
    const next = { ...data.matrix[role] };
    for (const c of changes) next[c.module] = { view: c.view, edit: c.edit, delete: c.delete };
    setData({ ...data, matrix: { ...data.matrix, [role]: next } });
    setBusy(changes.length === 1 ? changes[0].module : "*");
    try {
      const fresh = await apiFetch<Matrix>(`/api/admin/permissions/roles/${role}`, {
        method: "PUT",
        body: JSON.stringify({ changes }),
      });
      setData(fresh);
      setSaved(true);
    } catch (e) {
      setData(before);
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  };

  const bulk = (action: PermAction, on: boolean) => {
    if (!data) return;
    const cur = data.matrix[role];
    send(
      data.modules.map(({ key }) => {
        const p = { ...cur[key], [action]: on };
        if (action === "view" && !on) {
          p.edit = false;
          p.delete = false;
        }
        if (p.edit || p.delete) p.view = true;
        return { module: key, ...p, changed: action };
      }),
    );
  };

  const reset = async () => {
    setConfirmReset(false);
    setBusy("*");
    try {
      setData(
        await apiFetch<Matrix>(`/api/admin/permissions/roles/${role}/reset`, {
          method: "POST",
        }),
      );
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  };

  if (!isSuper)
    return <p className="font-ui text-sm text-foreground-muted">{t("rolesDenied")}</p>;
  if (!data)
    return error ? (
      <p className="font-ui text-sm text-brand-crimson">{error}</p>
    ) : (
      <p className="font-ui text-sm text-foreground-muted">{t("loading")}</p>
    );

  const current = data.matrix[role];
  const isDefault = data.modules.every(({ key }) => {
    const a = current[key];
    const b = data.defaults[role][key];
    return a.view === b.view && a.edit === b.edit && a.delete === b.delete;
  });

  return (
    <div className="max-w-5xl pb-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-heading">
            <ShieldCheck className="h-6 w-6 text-brand-crimson" />
            {t("rolesTitle")}
          </h1>
          <p className="mt-1 max-w-2xl font-ui text-sm text-foreground-muted">
            {ax("কোন রোল কোন মডিউল দেখতে, এডিট করতে বা মুছতে পারবে তা এখান থেকে ঠিক করুন। কোনো একজনের জন্য আলাদা অনুমতি দিতে ইউজার পাতায় যান।")}
          </p>
        </div>
        <Link
          href="/admin/users"
          className="flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 font-ui text-sm font-semibold text-foreground hover:bg-surface"
        >
          <Users className="h-4 w-4" />
          {t("usersRoles")}
        </Link>
      </div>

      {/* Pick a role */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-4">
          <p className="flex items-center gap-1.5 font-ui text-sm font-semibold text-heading">
            <Crown className="h-4 w-4 text-amber-500" />
            {t("roleSUPER_ADMIN")}
          </p>
          <p className="mt-1 font-ui text-xs leading-relaxed text-foreground-muted">
            {ax("সব অনুমতি সবসময় — বদলানো যায় না")}
          </p>
          <p className="mt-2 font-ui text-[11px] text-foreground-muted/80">
            {data.userCounts.SUPER_ADMIN ?? 0} {ax("জন")}
          </p>
        </div>
        {data.roles.map((r) => {
          const { open, total } = countModules(data.matrix[r]);
          const active = r === role;
          return (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`rounded-2xl border p-4 text-left transition-all ${
                active
                  ? "border-brand-crimson bg-brand-crimson/[0.05] shadow-[0_0_0_3px_rgba(200,16,46,0.08)]"
                  : "border-border bg-background hover:border-brand-crimson/40"
              }`}
            >
              <p className="font-ui text-sm font-semibold text-heading">
                {t(`role${r}` as AdminKey)}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-brand-crimson transition-all"
                  style={{ width: `${total ? (open / total) * 100 : 0}%` }}
                />
              </div>
              <p className="mt-1.5 flex items-center justify-between font-ui text-[11px] text-foreground-muted">
                <span>
                  {open}/{total} {ax("মডিউল")}
                </span>
                <span>
                  {data.userCounts[r] ?? 0} {ax("জন")}
                </span>
              </p>
            </button>
          );
        })}
      </div>

      {/* What applies to everyone below the Super Admin */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3">
        <p className="flex items-center gap-2 font-ui text-xs text-foreground-muted">
          <Zap className="h-4 w-4 shrink-0 text-amber-500" />
          {ax("পরিবর্তন সাথে সাথে কার্যকর হয় — এই রোলের সবার প্যানেল তৎক্ষণাৎ বদলে যায়। সুপার অ্যাডমিন ছাড়া সবার খবর প্রকাশের আগে অনুমোদনে যায়।")}
        </p>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 font-ui text-xs font-semibold text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              {ax("সংরক্ষিত")}
            </span>
          )}
          <button
            type="button"
            disabled={isDefault || busy !== null}
            onClick={() => setConfirmReset(true)}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-ui text-xs font-semibold text-foreground hover:bg-surface disabled:opacity-40"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {ax("ডিফল্টে ফেরান")}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-brand-crimson/10 px-3.5 py-2 font-ui text-sm text-brand-crimson">
          {error}
        </p>
      )}

      <div className="mt-4">
        <PermissionMatrix
          modules={data.modules}
          value={current}
          busy={busy}
          onChange={(module, p, changed) => send([{ module, ...p, changed }])}
          onBulk={bulk}
        />
      </div>

      {confirmReset && (
        <ConfirmModal
          title={ax("ডিফল্টে ফেরাবেন?")}
          message={ax("এই রোলের সব অনুমতি শুরুর অবস্থায় ফিরে যাবে।")}
          confirmLabel={ax("ফেরান")}
          onConfirm={reset}
          onClose={() => setConfirmReset(false)}
        />
      )}
    </div>
  );
}
