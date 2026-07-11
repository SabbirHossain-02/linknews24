"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, Pencil } from "lucide-react";
import type { AccountUser } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { EditProfileModal } from "./EditProfileModal";

export function ProfileCard({
  user,
  onLogout,
}: {
  user: AccountUser;
  onLogout: () => void;
}) {
  const { t, locale } = useLocale();
  const [editing, setEditing] = useState(false);
  const initial = user.name.charAt(0).toUpperCase();

  const memberSince = user.joinedAt
    ? new Date(user.joinedAt).toLocaleDateString(
        locale === "bn" ? "bn-BD" : "en-GB",
        { year: "numeric", month: "long" },
      )
    : null;

  return (
    <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-brand-crimson">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              fill
              sizes="64px"
              className="object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center font-ui text-2xl font-bold text-white">
              {initial}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-bold text-heading">{user.name}</p>
          <p className="truncate font-ui text-sm text-foreground-muted">
            {user.email}
          </p>
          {user.bio && (
            <p className="mt-2 text-sm text-foreground">{user.bio}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-ui text-xs text-foreground-muted">
            {user.city && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {user.city}
              </span>
            )}
            {memberSince && (
              <span>
                {t("memberSince")}: {memberSince}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setEditing(true)}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 font-ui text-sm font-medium text-foreground transition-colors hover:bg-surface"
        >
          <Pencil className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t("editProfile")}</span>
        </button>
      </div>

      <div className="mt-4 flex justify-end border-t border-border pt-4">
        <button
          onClick={onLogout}
          className="rounded-lg px-4 py-2 font-ui text-sm font-medium text-brand-crimson transition-colors hover:bg-surface"
        >
          {t("logout")}
        </button>
      </div>

      {editing && (
        <EditProfileModal user={user} onClose={() => setEditing(false)} />
      )}
    </div>
  );
}
