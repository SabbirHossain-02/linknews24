"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, Upload } from "lucide-react";
import { apiFetch, uploadFile } from "@/lib/admin-api";
import { RichTextEditor } from "./RichTextEditor";
import { Modal } from "./Modal";
import { toneGradientClass } from "@/lib/tone";

interface Category {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
}

interface FormState {
  title: string;
  titleEn: string;
  slug: string;
  excerpt: string;
  excerptEn: string;
  body: string;
  bodyEn: string;
  categoryId: string;
  imageTone: string;
  featuredImage: string;
  isBreaking: boolean;
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
}

const EMPTY: FormState = {
  title: "",
  titleEn: "",
  slug: "",
  excerpt: "",
  excerptEn: "",
  body: "",
  bodyEn: "",
  categoryId: "",
  imageTone: "navy",
  featuredImage: "",
  isBreaking: false,
  featured: false,
  seoTitle: "",
  seoDescription: "",
};

const TONES = ["navy", "crimson", "slate", "amber"];

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand-crimson focus:outline-none focus:ring-2 focus:ring-brand-crimson/15";

export function ArticleForm({ articleId }: { articleId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(Boolean(articleId));
  const [showPreview, setShowPreview] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverRef = useRef<HTMLInputElement>(null);

  const pickCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingCover(true);
    try {
      set("featuredImage", await uploadFile(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "আপলোড ব্যর্থ");
    } finally {
      setUploadingCover(false);
    }
  };

  const categoryName =
    categories.find((c) => c.id === form.categoryId)?.name ?? "";

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: val }));

  useEffect(() => {
    apiFetch<{ categories: Category[] }>("/api/categories")
      .then((d) => setCategories(d.categories))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!articleId) return;
    apiFetch<{ article: FormState & { id: string } }>(
      `/api/admin/articles/${articleId}`,
    )
      .then((d) => {
        const a = d.article;
        setForm({
          title: a.title ?? "",
          titleEn: a.titleEn ?? "",
          slug: a.slug ?? "",
          excerpt: a.excerpt ?? "",
          excerptEn: a.excerptEn ?? "",
          body: a.body ?? "",
          bodyEn: a.bodyEn ?? "",
          categoryId: a.categoryId ?? "",
          imageTone: a.imageTone ?? "navy",
          featuredImage: a.featuredImage ?? "",
          isBreaking: a.isBreaking ?? false,
          featured: a.featured ?? false,
          seoTitle: a.seoTitle ?? "",
          seoDescription: a.seoDescription ?? "",
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [articleId]);

  const submit = async (status: "DRAFT" | "PUBLISHED") => {
    setError(null);
    if (!form.title.trim()) return setError("শিরোনাম দিন");
    if (!form.categoryId) return setError("ক্যাটাগরি নির্বাচন করুন");
    setBusy(true);
    try {
      const payload = { ...form, status };
      if (articleId) {
        await apiFetch(`/api/admin/articles/${articleId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch("/api/admin/articles", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      router.push("/admin/articles");
    } catch (e) {
      setError(e instanceof Error ? e.message : "সংরক্ষণ ব্যর্থ");
    } finally {
      setBusy(false);
    }
  };

  if (loading)
    return <p className="font-ui text-sm text-foreground-muted">লোড হচ্ছে…</p>;

  return (
    <div>
      <Link
        href="/admin/articles"
        className="inline-flex items-center gap-1.5 font-ui text-sm text-foreground-muted hover:text-brand-crimson"
      >
        <ArrowLeft className="h-4 w-4" />
        সব আর্টিকেল
      </Link>
      <h1 className="mt-3 text-2xl font-bold text-heading">
        {articleId ? "আর্টিকেল এডিট" : "নতুন আর্টিকেল"}
      </h1>

      {error && (
        <p className="mt-4 rounded-lg bg-brand-crimson/10 px-3.5 py-2 font-ui text-sm text-brand-crimson">
          {error}
        </p>
      )}

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main column */}
        <div className="flex flex-col gap-4">
          <div>
            <label className="font-ui text-xs font-semibold text-foreground-muted">
              শিরোনাম (বাংলা)
            </label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="আর্টিকেলের শিরোনাম"
              className={`${inputCls} mt-1 text-base font-semibold`}
            />
          </div>
          <div>
            <label className="font-ui text-xs font-semibold text-foreground-muted">
              Title (English)
            </label>
            <input
              value={form.titleEn}
              onChange={(e) => set("titleEn", e.target.value)}
              placeholder="Article title"
              className={`${inputCls} mt-1`}
            />
          </div>
          <div>
            <label className="font-ui text-xs font-semibold text-foreground-muted">
              সারসংক্ষেপ (বাংলা)
            </label>
            <textarea
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              rows={2}
              className={`${inputCls} mt-1 resize-none`}
            />
          </div>

          <div>
            <label className="font-ui text-xs font-semibold text-foreground-muted">
              মূল লেখা (বাংলা)
            </label>
            <div className="mt-1">
              <RichTextEditor
                value={form.body}
                onChange={(html) => set("body", html)}
              />
            </div>
          </div>

          <div>
            <label className="font-ui text-xs font-semibold text-foreground-muted">
              Body (English)
            </label>
            <div className="mt-1">
              <RichTextEditor
                value={form.bodyEn}
                onChange={(html) => set("bodyEn", html)}
                placeholder="Write here…"
              />
            </div>
          </div>
        </div>

        {/* Side column */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="flex gap-2">
              <button
                onClick={() => submit("PUBLISHED")}
                disabled={busy}
                className="flex-1 rounded-lg bg-brand-crimson py-2.5 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark disabled:opacity-60"
              >
                প্রকাশ করুন
              </button>
              <button
                onClick={() => submit("DRAFT")}
                disabled={busy}
                className="rounded-lg border border-border px-3 py-2.5 font-ui text-sm text-foreground hover:bg-surface disabled:opacity-60"
              >
                খসড়া
              </button>
            </div>
            <button
              onClick={() => setShowPreview(true)}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 font-ui text-sm font-medium text-foreground hover:bg-surface"
            >
              <Eye className="h-4 w-4" />
              প্রিভিউ দেখুন
            </button>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4">
            <div>
              <label className="font-ui text-xs font-semibold text-foreground-muted">
                ক্যাটাগরি
              </label>
              <select
                value={form.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
                className={`${inputCls} mt-1`}
              >
                <option value="">নির্বাচন করুন</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-ui text-xs font-semibold text-foreground-muted">
                স্লাগ (URL)
              </label>
              <input
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="auto"
                className={`${inputCls} mt-1`}
              />
            </div>
            <div>
              <label className="font-ui text-xs font-semibold text-foreground-muted">
                কভার টোন
              </label>
              <select
                value={form.imageTone}
                onChange={(e) => set("imageTone", e.target.value)}
                className={`${inputCls} mt-1`}
              >
                {TONES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-ui text-xs font-semibold text-foreground-muted">
                ফিচার্ড ইমেজ
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  value={form.featuredImage}
                  onChange={(e) => set("featuredImage", e.target.value)}
                  placeholder="URL অথবা আপলোড"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => coverRef.current?.click()}
                  disabled={uploadingCover}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 font-ui text-sm text-foreground hover:bg-surface disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                </button>
                <input
                  ref={coverRef}
                  type="file"
                  accept="image/*"
                  onChange={pickCover}
                  className="hidden"
                />
              </div>
              {form.featuredImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.featuredImage}
                  alt=""
                  className="mt-2 aspect-video w-full rounded-lg object-cover"
                />
              )}
            </div>
            <label className="flex items-center gap-2 font-ui text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.isBreaking}
                onChange={(e) => set("isBreaking", e.target.checked)}
                className="h-4 w-4 accent-brand-crimson"
              />
              ব্রেকিং নিউজ
            </label>
            <label className="flex items-center gap-2 font-ui text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => set("featured", e.target.checked)}
                className="h-4 w-4 accent-brand-crimson"
              />
              হোমপেজে ফিচার
            </label>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4">
            <p className="font-ui text-xs font-semibold uppercase tracking-wide text-foreground-muted/70">
              SEO
            </p>
            <input
              value={form.seoTitle}
              onChange={(e) => set("seoTitle", e.target.value)}
              placeholder="SEO টাইটেল"
              className={inputCls}
            />
            <textarea
              value={form.seoDescription}
              onChange={(e) => set("seoDescription", e.target.value)}
              placeholder="SEO ডেসক্রিপশন"
              rows={2}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>
      </div>

      {showPreview && (
        <Modal title="প্রিভিউ — ফ্রন্টএন্ডে যেমন দেখাবে" wide onClose={() => setShowPreview(false)}>
          <article className="ln-editor max-h-[70vh] overflow-y-auto">
            {categoryName && (
              <span className="font-ui text-xs font-semibold uppercase tracking-wide text-brand-crimson">
                {categoryName}
              </span>
            )}
            <h1 className="mt-1 text-2xl font-bold leading-tight text-heading sm:text-3xl">
              {form.title || "শিরোনাম নেই"}
            </h1>
            {form.excerpt && (
              <p className="mt-2 text-base text-foreground-muted">{form.excerpt}</p>
            )}
            {form.featuredImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.featuredImage}
                alt=""
                className="mt-4 aspect-video w-full rounded-lg object-cover"
              />
            ) : (
              <div
                className={`mt-4 aspect-video w-full rounded-lg ${toneGradientClass(
                  (form.imageTone as "navy" | "crimson" | "slate" | "amber") ??
                    "navy",
                )}`}
              />
            )}
            <div
              className="mt-5 text-[17px] leading-relaxed text-foreground"
              dangerouslySetInnerHTML={{ __html: form.body || "<p>লেখা নেই</p>" }}
            />
          </article>
        </Modal>
      )}
    </div>
  );
}
