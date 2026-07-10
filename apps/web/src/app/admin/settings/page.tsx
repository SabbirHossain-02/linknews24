"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/admin-api";
import { useAdminT } from "@/lib/admin-i18n";

interface Settings {
  siteName?: string;
  tagline?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  address?: string;
  email?: string;
  phone?: string;
  editor?: string;
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

export default function SettingsAdminPage() {
  const t = useAdminT();
  const [s, setS] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k: keyof Settings, v: string) => setS((p) => ({ ...p, [k]: v }));

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

  if (loading)
    return <p className="font-ui text-sm text-foreground-muted">{t("loading")}</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-heading">{t("settings")}</h1>

      <div className="mt-5 flex flex-col gap-4 rounded-xl border border-border bg-background p-5">
        <Field label={t("siteName")} value={s.siteName ?? ""} onChange={(v) => set("siteName", v)} />
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
