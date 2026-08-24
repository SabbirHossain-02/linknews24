"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FileSearch,
  Upload,
  XCircle,
} from "lucide-react";
import { apiFetch, uploadFile } from "@/lib/admin-api";
import { getSocket } from "@/lib/socket";
import { Toggle } from "@/components/admin/Toggle";
import { useAdminT, type AdminKey } from "@/lib/admin-i18n";
import { useAdminText } from "@/lib/admin-strings";

interface SeoSettings {
  siteName: string;
  titleTemplate: string;
  defaultTitle: string;
  defaultTitleEn: string;
  defaultDescription: string;
  defaultDescriptionEn: string;
  keywords: string;
  defaultOgImage: string;
  twitterHandle: string;
  indexable: boolean;
  robotsDisallow: string;
  googleVerification: string;
  bingVerification: string;
  organizationName: string;
  organizationLogo: string;
}

interface Issue {
  level: "error" | "warning";
  code: string;
  articleId: string;
  slug: string;
  title: string;
  detail?: string;
}

interface Payload {
  settings: SeoSettings;
  sitemap: {
    articles: number;
    categories: number;
    staticPages: number;
    total: number;
  };
  audit: {
    checked: number;
    errors: number;
    warnings: number;
    score: number | null;
    issues: Issue[];
  };
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand-crimson focus:outline-none focus:ring-2 focus:ring-brand-crimson/15";

/** The public site's own origin — what canonical URLs and the sitemap use. */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export default function SeoAdminPage() {
  const ax = useAdminText();
  const t = useAdminT();
  const [data, setData] = useState<Payload | null>(null);
  const [form, setForm] = useState<SeoSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"og" | "logo" | null>(null);

  const load = useCallback(
    (keepForm = false) =>
      apiFetch<Payload>("/api/admin/seo")
        .then((d) => {
          setData(d);
          if (!keepForm) setForm(d.settings);
        })
        .catch((e) => setError(e instanceof Error ? e.message : "load failed")),
    [],
  );

  // The audit re-runs whenever an article changes, so the list is never stale.
  useEffect(() => {
    load();
    const socket = getSocket();
    const onChange = () => load(true);
    socket.on("content:changed", onChange);
    return () => {
      socket.off("content:changed", onChange);
    };
  }, [load]);

  const set = <K extends keyof SeoSettings>(k: K, v: SeoSettings[K]) =>
    setForm((f) => (f ? { ...f, [k]: v } : f));

  const pick = async (e: React.ChangeEvent<HTMLInputElement>, which: "og" | "logo") => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(which);
    setError(null);
    try {
      const url = await uploadFile(file);
      set(which === "og" ? "defaultOgImage" : "organizationLogo", url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "upload failed");
    } finally {
      setUploading(null);
    }
  };

  const save = async () => {
    if (!form) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch("/api/admin/seo", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      await load(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errSave"));
    } finally {
      setSaving(false);
    }
  };

  if (!form || !data) {
    return (
      <p className="font-ui text-sm text-foreground-muted">
        {error ?? t("loading")}
      </p>
    );
  }

  const { audit, sitemap } = data;
  // Errors first — a missing description costs more than a long title.
  const issues = [...audit.issues].sort((a, b) =>
    a.level === b.level ? 0 : a.level === "error" ? -1 : 1,
  );

  return (
    <div className="pb-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-heading">{t("seo")}</h1>
          <p className="mt-1 font-ui text-sm text-foreground-muted">
            {t("seoIntro")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="font-ui text-xs font-semibold text-green-700">
              {t("savedOk")}
            </span>
          )}
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-brand-crimson px-4 py-2.5 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark disabled:opacity-50"
          >
            {t("save")}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-brand-crimson/10 px-3.5 py-2 font-ui text-sm text-brand-crimson">
          {error}
        </p>
      )}

      {/* ---------- health ---------- */}
      <section className="mt-6 grid gap-4 sm:grid-cols-4">
        <Card
          value={audit.score === null ? "—" : `${audit.score}%`}
          label={t("seoScore")}
          tone={
            audit.score === null || audit.score >= 80
              ? "good"
              : audit.score >= 50
                ? "warn"
                : "bad"
          }
        />
        <Card value={audit.checked} label={t("seoChecked")} />
        <Card value={audit.errors} label={t("seoErrors")} tone={audit.errors ? "bad" : "good"} />
        <Card
          value={audit.warnings}
          label={t("seoWarnings")}
          tone={audit.warnings ? "warn" : "good"}
        />
      </section>

      {/* ---------- site defaults ---------- */}
      <Section title={t("seoDefaults")} note={t("seoDefaultsNote")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("seoSiteName")}>
            <input
              className={inputCls}
              value={form.siteName}
              onChange={(e) => set("siteName", e.target.value)}
            />
          </Field>
          <Field label={t("seoTitleTemplate")} hint={t("seoTitleTemplateHint")}>
            <input
              className={inputCls}
              value={form.titleTemplate}
              onChange={(e) => set("titleTemplate", e.target.value)}
            />
          </Field>
          <Field label={`${t("seoDefaultTitle")} (${ax("বাংলা")})`} count={form.defaultTitle.length} max={60}>
            <input
              className={inputCls}
              value={form.defaultTitle}
              onChange={(e) => set("defaultTitle", e.target.value)}
            />
          </Field>
          <Field label={`${t("seoDefaultTitle")} (English)`} count={form.defaultTitleEn.length} max={60}>
            <input
              className={inputCls}
              value={form.defaultTitleEn}
              onChange={(e) => set("defaultTitleEn", e.target.value)}
            />
          </Field>
          <Field
            label={`${t("seoDefaultDesc")} (${ax("বাংলা")})`}
            count={form.defaultDescription.length}
            max={160}
          >
            <textarea
              rows={3}
              className={inputCls}
              value={form.defaultDescription}
              onChange={(e) => set("defaultDescription", e.target.value)}
            />
          </Field>
          <Field
            label={`${t("seoDefaultDesc")} (English)`}
            count={form.defaultDescriptionEn.length}
            max={160}
          >
            <textarea
              rows={3}
              className={inputCls}
              value={form.defaultDescriptionEn}
              onChange={(e) => set("defaultDescriptionEn", e.target.value)}
            />
          </Field>
          <Field label={t("seoKeywords")} hint={t("seoKeywordsHint")}>
            <input
              className={inputCls}
              value={form.keywords}
              onChange={(e) => set("keywords", e.target.value)}
            />
          </Field>
          <Field label={t("seoTwitter")}>
            <input
              className={inputCls}
              placeholder="@linknews24"
              value={form.twitterHandle}
              onChange={(e) => set("twitterHandle", e.target.value)}
            />
          </Field>
        </div>

        {/* How the page will look in Google — built from the fields above. */}
        <div className="mt-5 rounded-lg border border-border bg-surface/50 p-4">
          <p className="mb-2 font-ui text-xs font-semibold text-foreground-muted">
            {t("seoPreview")}
          </p>
          <p className="font-ui text-xs text-green-700">{SITE_URL || "—"}</p>
          <p className="mt-0.5 truncate text-[18px] text-[#1a0dab]">
            {form.defaultTitle || "—"}
          </p>
          <p className="mt-0.5 line-clamp-2 font-ui text-[13px] text-foreground-muted">
            {form.defaultDescription || "—"}
          </p>
        </div>
      </Section>

      {/* ---------- images ---------- */}
      <Section title={t("seoImages")} note={t("seoImagesNote")}>
        <div className="grid gap-4 sm:grid-cols-2">
          <ImageField
            label={t("seoOgImage")}
            value={form.defaultOgImage}
            busy={uploading === "og"}
            onPick={(e) => pick(e, "og")}
            onChange={(v) => set("defaultOgImage", v)}
            cls={inputCls}
            uploadLabel={t("urlOrUpload")}
          />
          <ImageField
            label={t("seoOrgLogo")}
            value={form.organizationLogo}
            busy={uploading === "logo"}
            onPick={(e) => pick(e, "logo")}
            onChange={(v) => set("organizationLogo", v)}
            cls={inputCls}
            uploadLabel={t("urlOrUpload")}
          />
        </div>
        <div className="mt-4">
          <Field label={t("seoOrgName")}>
            <input
              className={inputCls}
              value={form.organizationName}
              onChange={(e) => set("organizationName", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      {/* ---------- crawling ---------- */}
      <Section title={t("seoCrawling")} note={t("seoCrawlingNote")}>
        <label className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
          <span>
            <span className="block font-ui text-sm font-medium text-foreground">
              {t("seoIndexable")}
            </span>
            <span className="mt-0.5 block font-ui text-xs text-foreground-muted">
              {form.indexable ? t("seoIndexableOn") : t("seoIndexableOff")}
            </span>
          </span>
          <Toggle
            size="md"
            checked={form.indexable}
            onChange={(v) => set("indexable", v)}
            title={t("seoIndexable")}
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label={t("seoDisallow")} hint={t("seoDisallowHint")}>
            <textarea
              rows={4}
              className={`${inputCls} font-ui`}
              value={form.robotsDisallow}
              onChange={(e) => set("robotsDisallow", e.target.value)}
            />
          </Field>
          <div className="flex flex-col gap-4">
            <Field label={t("seoGoogleVerify")} hint={t("seoVerifyHint")}>
              <input
                className={inputCls}
                value={form.googleVerification}
                onChange={(e) => set("googleVerification", e.target.value)}
              />
            </Field>
            <Field label={t("seoBingVerify")}>
              <input
                className={inputCls}
                value={form.bingVerification}
                onChange={(e) => set("bingVerification", e.target.value)}
              />
            </Field>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <LinkOut href={`${SITE_URL}/robots.txt`} label="robots.txt" />
          <LinkOut
            href={`${SITE_URL}/sitemap.xml`}
            label={`sitemap.xml — ${sitemap.total} ${t("seoUrls")}`}
          />
        </div>
        <p className="mt-2 font-ui text-xs text-foreground-muted">
          {t("seoSitemapBreakdown", {
            a: String(sitemap.articles),
            c: String(sitemap.categories),
            s: String(sitemap.staticPages),
          })}
        </p>
      </Section>

      {/* ---------- audit ---------- */}
      <Section title={t("seoAudit")} note={t("seoAuditNote")}>
        {issues.length === 0 ? (
          <p className="flex items-center gap-2 font-ui text-sm text-green-700">
            <CheckCircle2 className="h-4 w-4" />
            {audit.checked === 0 ? t("seoNoArticles") : t("seoAllClear")}
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {issues.map((i, n) => (
              <li key={`${i.articleId}-${i.code}-${n}`} className="flex items-start gap-3 py-2.5">
                {i.level === "error" ? (
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-crimson" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-ui text-sm text-foreground">
                    {t(`seoIssue_${i.code}` as AdminKey)}
                    {i.detail && (
                      <span className="ml-1.5 font-ui text-xs text-foreground-muted">
                        ({i.detail})
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 truncate font-ui text-xs text-foreground-muted">
                    {i.title}
                  </p>
                </div>
                <Link
                  href={`/admin/articles/${i.articleId}`}
                  className="shrink-0 font-ui text-xs font-semibold text-brand-crimson hover:underline"
                >
                  {t("edit")}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

// --- small pieces ---

function Card({
  value,
  label,
  tone = "plain",
}: {
  value: number | string;
  label: string;
  tone?: "good" | "warn" | "bad" | "plain";
}) {
  const color =
    tone === "good"
      ? "text-green-700"
      : tone === "warn"
        ? "text-amber-600"
        : tone === "bad"
          ? "text-brand-crimson"
          : "text-heading";
  return (
    <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="font-ui text-xs text-foreground-muted">{label}</p>
    </div>
  );
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 rounded-xl border border-border bg-background p-5">
      <h2 className="flex items-center gap-2 font-ui text-sm font-semibold text-heading">
        <FileSearch className="h-4 w-4 text-brand-crimson" />
        {title}
      </h2>
      {note && (
        <p className="mt-1 font-ui text-xs leading-relaxed text-foreground-muted">
          {note}
        </p>
      )}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  count,
  max,
  children,
}: {
  label: string;
  hint?: string;
  /** Shows a live character count against the length search engines cut at. */
  count?: number;
  max?: number;
  children: React.ReactNode;
}) {
  const over = count !== undefined && max !== undefined && count > max;
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-2">
        <span className="font-ui text-xs font-medium text-foreground">{label}</span>
        {count !== undefined && max !== undefined && (
          <span
            className={`font-ui text-[11px] tabular-nums ${
              over ? "font-semibold text-amber-600" : "text-foreground-muted/70"
            }`}
          >
            {count} / {max}
          </span>
        )}
      </span>
      <span className="mt-1 block">{children}</span>
      {hint && (
        <span className="mt-1 block font-ui text-[11px] leading-snug text-foreground-muted">
          {hint}
        </span>
      )}
    </label>
  );
}

function ImageField({
  label,
  value,
  busy,
  onPick,
  onChange,
  cls,
  uploadLabel,
}: {
  label: string;
  value: string;
  busy: boolean;
  onPick: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChange: (v: string) => void;
  cls: string;
  uploadLabel: string;
}) {
  return (
    <div>
      <span className="font-ui text-xs font-medium text-foreground">{label}</span>
      <div className="mt-1 flex gap-2">
        <input
          className={cls}
          placeholder="https://…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <label className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 font-ui text-xs font-semibold text-foreground hover:bg-surface">
          <Upload className="h-3.5 w-3.5" />
          {busy ? "…" : uploadLabel}
          <input type="file" accept="image/*" className="sr-only" onChange={onPick} />
        </label>
      </div>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="mt-2 h-24 w-full rounded-lg border border-border object-cover"
        />
      )}
    </div>
  );
}

function LinkOut({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-ui text-xs font-semibold text-foreground hover:border-brand-crimson/40 hover:bg-surface"
    >
      {label}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}
