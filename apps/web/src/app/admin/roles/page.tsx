"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Minus, ShieldCheck } from "lucide-react";
import { apiFetch } from "@/lib/admin-api";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import { useAdminT, type AdminKey } from "@/lib/admin-i18n";

interface Capability {
  key: string;
  group: "content" | "directory" | "site" | "account";
  roles: string[];
}

interface Matrix {
  roles: string[];
  capabilities: Capability[];
}

const GROUPS: Capability["group"][] = ["content", "directory", "site", "account"];

/**
 * Who may do what.
 *
 * The table is not written out by hand — it comes from the same role lists the
 * server guards its routes with, so it cannot describe a permission that is not
 * actually enforced. If a guard changes, this page changes with it.
 */
export default function RolesAdminPage() {
  const t = useAdminT();
  const { user } = useAdminAuth();
  const [matrix, setMatrix] = useState<Matrix | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    apiFetch<Matrix>("/api/admin/permissions")
      .then(setMatrix)
      .catch(() => setDenied(true));
  }, []);

  if (denied)
    return (
      <p className="font-ui text-sm text-foreground-muted">{t("rolesDenied")}</p>
    );
  if (!matrix) return null;

  return (
    <div className="pb-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-heading">{t("rolesTitle")}</h1>
          <p className="mt-1 max-w-2xl font-ui text-sm text-foreground-muted">
            {t("rolesIntro")}
          </p>
        </div>
        <Link
          href="/admin/users"
          className="rounded-lg border border-border px-3.5 py-2 font-ui text-sm font-semibold text-foreground hover:bg-surface"
        >
          {t("usersRoles")}
        </Link>
      </div>

      {/* What each role is for */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {matrix.roles.map((r) => (
          <div
            key={r}
            className={`rounded-xl border p-4 ${
              user?.role === r
                ? "border-brand-crimson/40 bg-brand-crimson/[0.04]"
                : "border-border bg-background"
            }`}
          >
            <p className="flex items-center gap-2 font-ui text-sm font-semibold text-heading">
              <ShieldCheck className="h-4 w-4 text-brand-crimson" />
              {t(`role${r}` as AdminKey)}
              {user?.role === r && (
                <span className="rounded-full bg-brand-crimson px-2 py-0.5 font-ui text-[10px] font-bold text-white">
                  {t("rolesYou")}
                </span>
              )}
            </p>
            <p className="mt-1.5 font-ui text-xs leading-relaxed text-foreground-muted">
              {t(`roleAbout${r}` as AdminKey)}
            </p>
          </div>
        ))}
      </div>

      {/* The matrix */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border font-ui text-xs uppercase tracking-wide text-foreground-muted/70">
            <tr>
              <th className="px-4 py-3">{t("rolesCapability")}</th>
              {matrix.roles.map((r) => (
                <th key={r} className="px-3 py-3 text-center">
                  {t(`roleShort${r}` as AdminKey)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {GROUPS.map((g) => {
              const rows = matrix.capabilities.filter((c) => c.group === g);
              if (!rows.length) return null;
              return (
                <>
                  <tr key={g} className="bg-surface/60">
                    <td
                      colSpan={matrix.roles.length + 1}
                      className="px-4 py-1.5 font-ui text-[11px] font-bold uppercase tracking-wide text-foreground-muted"
                    >
                      {t(`capGroup_${g}` as AdminKey)}
                    </td>
                  </tr>
                  {rows.map((c) => (
                    <tr key={c.key} className="hover:bg-surface/40">
                      <td className="px-4 py-2.5 text-foreground">
                        {t(`cap_${c.key}` as AdminKey)}
                      </td>
                      {matrix.roles.map((r) => (
                        <td key={r} className="px-3 py-2.5 text-center">
                          {c.roles.includes(r) ? (
                            <Check
                              className="mx-auto h-4 w-4 text-green-600"
                              aria-label={t("rolesAllowed")}
                            />
                          ) : (
                            <Minus
                              className="mx-auto h-4 w-4 text-foreground-muted/30"
                              aria-label={t("rolesDeniedShort")}
                            />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 font-ui text-xs leading-relaxed text-foreground-muted">
        {t("rolesFooterNote")}
      </p>
    </div>
  );
}
