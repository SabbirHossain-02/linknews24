"use client";

import { Check, Eye, Pencil, RotateCcw, Trash2 } from "lucide-react";
import type { Module, Perm, PermAction, PermSet } from "./AdminAuthProvider";
import { MODULE_GROUP_LABEL, MODULE_META } from "@/lib/admin-modules";
import { useAdminT } from "@/lib/admin-i18n";
import { useAdminText } from "@/lib/admin-strings";

export interface ModuleInfo {
  key: Module;
  group: "content" | "directory" | "site";
}

const ACTIONS: { key: PermAction; icon: typeof Eye; label: string }[] = [
  { key: "view", icon: Eye, label: "দেখা" },
  { key: "edit", icon: Pencil, label: "এডিট" },
  { key: "delete", icon: Trash2, label: "ডিলিট" },
];

const GROUPS: ModuleInfo["group"][] = ["content", "directory", "site"];

/**
 * The grid of switches behind the Roles page and a person's own permissions:
 * one row per admin module, a View / Edit / Delete switch on each.
 *
 * Every switch saves on its own — there is no Save button to forget. The
 * caller passes `onChange` and decides what that means (a role, or one user).
 *
 * In a person's view, `base` is their role's setting; rows where they differ
 * are marked "custom" and can be put back to the role with one click.
 */
export function PermissionMatrix({
  modules,
  value,
  base,
  overridden,
  busy,
  onChange,
  onBulk,
  onReset,
}: {
  modules: ModuleInfo[];
  value: PermSet;
  base?: PermSet;
  overridden?: Set<string>;
  /** Module currently being saved, to show a quiet spinner on its row. */
  busy?: string | null;
  onChange: (module: Module, next: Perm, changed: PermAction) => void;
  /** Turn one switch on or off for every module at once. */
  onBulk?: (action: PermAction, on: boolean) => void;
  onReset?: (module: Module) => void;
}) {
  const t = useAdminT();
  const ax = useAdminText();

  const flip = (m: Module, a: PermAction) => {
    const cur = value[m];
    const next = { ...cur, [a]: !cur[a] };
    // Edit or delete needs view; switching view off takes the others with it.
    if (a === "view" && !next.view) {
      next.edit = false;
      next.delete = false;
    }
    if (next.edit || next.delete) next.view = true;
    onChange(m, next, a);
  };

  const allOn = (a: PermAction) => modules.every((m) => value[m.key]?.[a]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background">
      {/* Column heads, with an "all" switch under each. */}
      <div className="grid grid-cols-[minmax(0,1fr)_repeat(3,64px)] items-end gap-2 border-b border-border bg-surface/70 px-4 py-3 sm:grid-cols-[minmax(0,1fr)_repeat(3,88px)] sm:px-5">
        <span className="font-ui text-[11px] font-bold uppercase tracking-wide text-foreground-muted">
          {ax("মডিউল")}
        </span>
        {ACTIONS.map(({ key, icon: Icon, label }) => (
          <div key={key} className="flex flex-col items-center gap-1.5">
            <span className="flex items-center gap-1 font-ui text-[11px] font-bold uppercase tracking-wide text-foreground-muted">
              <Icon className="h-3.5 w-3.5" />
              {ax(label)}
            </span>
            {onBulk && (
              <button
                type="button"
                onClick={() => onBulk(key, !allOn(key))}
                className="rounded-full border border-border bg-background px-2 py-0.5 font-ui text-[10px] font-semibold text-foreground-muted transition-colors hover:border-brand-crimson hover:text-brand-crimson"
              >
                {allOn(key) ? ax("সব বন্ধ") : ax("সব চালু")}
              </button>
            )}
          </div>
        ))}
      </div>

      {GROUPS.map((g) => {
        const rows = modules.filter((m) => m.group === g);
        if (!rows.length) return null;
        return (
          <div key={g}>
            <p className="border-b border-border bg-surface/40 px-4 py-1.5 font-ui text-[11px] font-bold uppercase tracking-wide text-foreground-muted/80 sm:px-5">
              {ax(MODULE_GROUP_LABEL[g])}
            </p>
            <ul className="divide-y divide-border">
              {rows.map(({ key }) => {
                const meta = MODULE_META[key];
                const Icon = meta.icon;
                const p = value[key];
                const custom = overridden?.has(key);
                const none = !p.view && !p.edit && !p.delete;
                return (
                  <li
                    key={key}
                    className={`grid grid-cols-[minmax(0,1fr)_repeat(3,64px)] items-center gap-2 px-4 py-3 transition-colors sm:grid-cols-[minmax(0,1fr)_repeat(3,88px)] sm:px-5 ${
                      custom ? "bg-amber-50/70" : "hover:bg-surface/40"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          none
                            ? "bg-surface text-foreground-muted/60"
                            : "bg-brand-crimson/10 text-brand-crimson"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-1.5 font-ui text-sm font-semibold text-heading">
                          {t(meta.label)}
                          {custom && (
                            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 font-ui text-[10px] font-bold text-amber-700">
                              {ax("কাস্টম")}
                            </span>
                          )}
                          {busy === key && (
                            <span className="h-3 w-3 animate-spin rounded-full border-2 border-brand-crimson/30 border-t-brand-crimson" />
                          )}
                        </p>
                        <p className="truncate font-ui text-xs text-foreground-muted">
                          {ax(meta.about)}
                        </p>
                        {custom && base && onReset && (
                          <button
                            type="button"
                            onClick={() => onReset(key)}
                            className="mt-0.5 inline-flex items-center gap-1 font-ui text-[11px] font-semibold text-amber-700 hover:underline"
                          >
                            <RotateCcw className="h-3 w-3" />
                            {ax("রোলের মতো করুন")}
                          </button>
                        )}
                      </div>
                    </div>
                    {ACTIONS.map(({ key: a, label }) => {
                      const on = p[a];
                      const differs = base && base[key][a] !== on;
                      return (
                        <div key={a} className="flex justify-center">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={on}
                            aria-label={`${t(meta.label)} — ${ax(label)}`}
                            title={`${t(meta.label)} — ${ax(label)}`}
                            onClick={() => flip(key, a)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg border-2 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-crimson/40 sm:h-9 sm:w-9 ${
                              on
                                ? "border-green-600 bg-green-600 text-white shadow-[0_2px_6px_rgba(22,163,74,0.35)] hover:bg-green-700"
                                : "border-border bg-background text-transparent hover:border-foreground-muted/50"
                            } ${differs ? "ring-2 ring-amber-400 ring-offset-1" : ""}`}
                          >
                            <Check className="h-4 w-4" strokeWidth={3} />
                          </button>
                        </div>
                      );
                    })}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

/** "12 of 16 modules", for a role or person's summary line. */
export function countModules(set: PermSet | undefined) {
  if (!set) return { open: 0, total: 0 };
  const all = Object.values(set);
  return { open: all.filter((p) => p.view).length, total: all.length };
}
