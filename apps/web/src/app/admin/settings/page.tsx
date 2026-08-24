"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, User as UserIcon } from "lucide-react";
import { apiFetch, uploadFile } from "@/lib/admin-api";
import { useAdminAuth, type AdminUser } from "@/components/admin/AdminAuthProvider";
import { useAdminT, type AdminKey } from "@/lib/admin-i18n";
import { Toggle } from "@/components/admin/Toggle";
import { FOOTER_BLOCKS, footerShows, type FooterBlock } from "@/lib/footer-blocks";

interface Settings {
  tagline?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  address?: string;
  email?: string;
  phone?: string;
  editor?: string;
  footer?: Partial<Record<FooterBlock, boolean>>;
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-brand-crimson focus:outline-none focus:ring-2 focus:ring-brand-crimson/15";

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="font-ui text-xs font-semibold text-foreground-muted">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputCls} mt-1`}
      />
    </div>
  );
}

/**
 * Name and picture for whoever is signed in — the pair shown at the top right.
 * Kept apart from Users & Roles, which is about other people's accounts.
 */
function ProfileCard() {
  const t = useAdminT();
  const { user, refresh } = useAdminAuth();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setAvatar(user.avatar ?? null);
  }, [user]);

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      setAvatar(await uploadFile(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("uploadFailed"));
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!name.trim()) return setError(t("profileName"));
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await apiFetch<{ user: AdminUser }>("/api/admin/me", {
        method: "PUT",
        body: JSON.stringify({ name: name.trim(), avatar }),
      });
      // Re-read so the header picks up the new name and picture at once.
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errSave"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-5 flex flex-col gap-4 rounded-xl border border-border bg-background p-5">
      <div>
        <p className="font-ui text-sm font-semibold text-heading">
          {t("profileSection")}
        </p>
        <p className="mt-0.5 font-ui text-xs text-foreground-muted">
          {t("profileNote")}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatar}
            alt=""
            className="h-16 w-16 shrink-0 rounded-full object-cover ring-1 ring-border"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-surface text-foreground-muted ring-1 ring-border">
            <UserIcon className="h-6 w-6" />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-ui text-sm font-semibold text-foreground hover:bg-surface disabled:opacity-60"
          >
            <Upload className="h-3.5 w-3.5" />
            {uploading ? t("saving") : t("profilePhoto")}
          </button>
          {avatar && (
            <button
              type="button"
              onClick={() => setAvatar(null)}
              className="font-ui text-xs font-semibold text-brand-crimson hover:underline"
            >
              {t("profileRemovePhoto")}
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={pick}
          />
        </div>
      </div>

      <Field label={t("profileName")} value={name} onChange={setName} />

      {error && (
        <p className="font-ui text-sm text-brand-crimson">{error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={busy}
          className="rounded-lg bg-brand-crimson px-5 py-2.5 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark disabled:opacity-60"
        >
          {busy ? t("saving") : t("save")}
        </button>
        {saved && (
          <span className="font-ui text-sm text-green-600">{t("profileSaved")}</span>
        )}
      </div>
    </div>
  );
}

export default function SettingsAdminPage() {
  const t = useAdminT();
  const [s, setS] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k: keyof Settings, v: string) => setS((p) => ({ ...p, [k]: v }));

  // Not switched off means shown, so an unsaved settings row still gives a
  // complete footer.
  const shows = (b: FooterBlock) => footerShows(s.footer, b);
  const toggleBlock = (b: FooterBlock, on: boolean) =>
    setS((p) => ({ ...p, footer: { ...p.footer, [b]: on } }));

  useEffect(() => {
    apiFetch<{ settings: Settings }>("/api/admin/settings")
      .then((d) => setS(d.settings ?? {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setBusy(true);
    setSaved(false);
    try {
      await apiFetch("/api/admin/settings", { method: "PUT", body: JSON.stringify(s) });
      setSaved(true);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-heading">{t("settings")}</h1>

      <ProfileCard />

      <div className="mt-5 flex flex-col gap-4 rounded-xl border border-border bg-background p-5">
        <Field label={t("tagline")} value={s.tagline ?? ""} onChange={(v) => set("tagline", v)} />

        <p className="mt-2 font-ui text-xs font-semibold uppercase tracking-wide text-foreground-muted/70">
          {t("socialLinks")}
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Facebook" value={s.facebook ?? ""} onChange={(v) => set("facebook", v)} placeholder="https://" />
          <Field label="X / Twitter" value={s.twitter ?? ""} onChange={(v) => set("twitter", v)} placeholder="https://" />
          <Field label="YouTube" value={s.youtube ?? ""} onChange={(v) => set("youtube", v)} placeholder="https://" />
        </div>

        <p className="mt-2 font-ui text-xs font-semibold uppercase tracking-wide text-foreground-muted/70">
          {t("contactInfo")}
        </p>
        <Field label={t("addressLabel")} value={s.address ?? ""} onChange={(v) => set("address", v)} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={t("emailLabel")} value={s.email ?? ""} onChange={(v) => set("email", v)} />
          <Field label={t("phoneLabel")} value={s.phone ?? ""} onChange={(v) => set("phone", v)} />
        </div>
        <Field label={t("editorLabel")} value={s.editor ?? ""} onChange={(v) => set("editor", v)} />

        <p className="mt-2 font-ui text-xs font-semibold uppercase tracking-wide text-foreground-muted/70">
          {t("footerBlocks")}
        </p>
        <p className="-mt-2 font-ui text-xs text-foreground-muted">
          {t("footerBlocksNote")}
        </p>
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {FOOTER_BLOCKS.map((b) => (
            <li key={b} className="flex items-center justify-between gap-4 px-3.5 py-2.5">
              <span className="font-ui text-sm text-foreground">
                {t(`footerBlock_${b}` as AdminKey)}
              </span>
              <Toggle
                checked={shows(b)}
                onChange={(on) => toggleBlock(b, on)}
                title={t(`footerBlock_${b}` as AdminKey)}
              />
            </li>
          ))}
        </ul>

        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={save}
            disabled={busy}
            className="rounded-lg bg-brand-crimson px-5 py-2.5 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark disabled:opacity-60"
          >
            {busy ? t("saving") : t("save")}
          </button>
          {saved && <span className="font-ui text-sm text-green-600">{t("savedOk")}</span>}
        </div>
      </div>
    </div>
  );
}
