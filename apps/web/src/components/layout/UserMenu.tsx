"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { AuthModal } from "./AuthModal";

export function UserMenu() {
  const { user, ready, logout } = useAuth();
  const { t } = useLocale();
  const [open, setOpen] = useState(false);

  if (!ready) return <div className="h-7 w-7" aria-hidden />;
  if (!user) return <AuthModal />;

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div className="relative flex items-center gap-1.5" onMouseLeave={() => setOpen(false)}>
      <Link
        href="/dashboard"
        aria-label={t("myDashboard")}
        className="relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-crimson ring-1 ring-white/25 transition-opacity hover:opacity-90"
      >
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={user.name}
            fill
            sizes="28px"
            className="object-cover"
          />
        ) : (
          <span className="font-ui text-xs font-bold text-white">
            {initial}
          </span>
        )}
      </Link>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu"
        className="transition-colors hover:text-white"
      >
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-lg border border-border bg-background text-foreground shadow-lg">
          <div className="border-b border-border px-3.5 py-3">
            <p className="truncate text-sm font-semibold text-heading">
              {user.name}
            </p>
            <p className="truncate font-ui text-xs text-foreground-muted">
              {user.email}
            </p>
          </div>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 font-ui text-sm transition-colors hover:bg-surface"
          >
            <LayoutDashboard className="h-4 w-4" />
            {t("dashboard")}
          </Link>
          <button
            onClick={() => {
              logout();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left font-ui text-sm text-brand-crimson transition-colors hover:bg-surface"
          >
            <LogOut className="h-4 w-4" />
            {t("logout")}
          </button>
        </div>
      )}
    </div>
  );
}
