"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, RotateCcw } from "lucide-react";
import { apiFetch } from "@/lib/admin-api";
import { Modal } from "./Modal";
import { PermissionMatrix, type ModuleInfo } from "./PermissionMatrix";
import type { Module, Perm, PermAction, PermSet } from "./AdminAuthProvider";
import { useAdminT, type AdminKey } from "@/lib/admin-i18n";
import { useAdminText } from "@/lib/admin-strings";

interface View {
  user: { id: string; name: string; role: string };
  modules: ModuleInfo[];
  role: PermSet;
  overrides: Partial<PermSet>;
  effective: PermSet;
}

/**
 * One person's permissions: their role's settings, with any switch changed
 * here becoming an exception for them alone. Saved as each switch is flipped,
 * and their open panel updates at once.
 */
export function UserPermissionsModal({
  userId,
  onClose,
  onChanged,
}: {
  userId: string;
  onClose: () => void;
  /** So the list behind can update its "custom" count. */
  onChanged?: () => void;
}) {
  const t = useAdminT();
  const ax = useAdminText();
  const [view, setView] = useState<View | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiFetch<View>(`/api/admin/users/${userId}/permissions`)
      .then(setView)
      .catch((e) => setError(e.message));
  }, [userId]);

  useEffect(() => {
    if (!saved) return;
    const id = setTimeout(() => setSaved(false), 1800);
    return () => clearTimeout(id);
  }, [saved]);

  const apply = async (req: Promise<View>, key: string) => {
    setBusy(key);
    setError(null);
    try {
      setView(await req);
      setSaved(true);
      onChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(null);
    }
  };

  const change = (module: Module, p: Perm, changed: PermAction) => {
    if (!view) return;
    setView({ ...view, effective: { ...view.effective, [module]: p } });
    apply(
      apiFetch<View>(`/api/admin/users/${userId}/permissions`, {
        method: "PUT",
        body: JSON.stringify({ changes: [{ module, ...p, changed }] }),
      }),
      module,
    );
  };

  const reset = (module?: Module) =>
    apply(
      apiFetch<View>(
        `/api/admin/users/${userId}/permissions${module ? `?module=${module}` : ""}`,
        { method: "DELETE" },
      ),
      module ?? "*",
    );

  const custom = new Set(Object.keys(view?.overrides ?? {}));

  return (
    <Modal
      wide
      title={view ? `${view.user.name} — ${ax("অনুমতি")}` : ax("অনুমতি")}
      onClose={onClose}
    >
      {!view ? (
        <p className="font-ui text-sm text-foreground-muted">
          {error ?? t("loading")}
        </p>
      ) : view.user.role === "SUPER_ADMIN" ? (
        <p className="font-ui text-sm text-foreground-muted">
          {ax("সুপার অ্যাডমিনের সব অনুমতি সবসময় থাকে")}
        </p>
      ) : (
        <div className="max-h-[70vh] overflow-y-auto">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="font-ui text-xs leading-relaxed text-foreground-muted">
              {ax("রোল")}: <b className="text-foreground">{t(`role${view.user.role}` as AdminKey)}</b>
              {" · "}
              {ax("এখানে বদলালে শুধু এই ব্যক্তির জন্য আলাদা (কাস্টম) অনুমতি হবে।")}
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
                disabled={custom.size === 0 || busy !== null}
                onClick={() => reset()}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-ui text-xs font-semibold text-foreground hover:bg-surface disabled:opacity-40"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {ax("সব রোলের মতো করুন")}
              </button>
            </div>
          </div>
          {error && (
            <p className="mb-3 rounded-lg bg-brand-crimson/10 px-3.5 py-2 font-ui text-sm text-brand-crimson">
              {error}
            </p>
          )}
          <PermissionMatrix
            modules={view.modules}
            value={view.effective}
            base={view.role}
            overridden={custom}
            busy={busy}
            onChange={change}
            onReset={(m) => reset(m)}
          />
        </div>
      )}
    </Modal>
  );
}
