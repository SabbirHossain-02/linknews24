"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  ExternalLink,
  Eye,
  MapPin,
  MessageCircle,
  MousePointerClick,
  Pencil,
  Phone,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import {
  PlacementDiagram,
  PlacementPicker,
  SITE_WIDE,
  TargetPicker,
  placementLabel,
  targetReady,
  targetText,
  useBi,
  type AdTarget,
  type TargetType,
} from "@/components/ads/AdTargeting";
import { apiFetch, uploadFile } from "@/lib/admin-api";
import { getSocket } from "@/lib/socket";
import { ConfirmModal, Modal } from "@/components/admin/Modal";
import { AdReport } from "@/components/admin/AdReport";
import { useAdminT } from "@/lib/admin-i18n";
import { useAdminText } from "@/lib/admin-strings";
import { useLocale } from "@/components/providers/LocaleProvider";

type Placement = "HEADER" | "LEFT" | "SIDEBAR" | "IN_ARTICLE" | "FOOTER" | "POPUP";

interface Ad {
  id: string;
  name: string;
  imageUrl: string;
  linkUrl: string;
  placement: Placement;
  targetType: TargetType;
  targetSlug: string | null;
  targetLabel: string | null;
  targetIncludesArticles: boolean;
  customerPhone: string | null;
  createdAt: string;
  active: boolean;
  status: "PENDING" | "ACTIVE" | "REJECTED" | "EXPIRED";
  amount: number;
  days: number;
  impressions: number;
  clicks: number;
  startsAt: string | null;
  endsAt: string | null;
  account: { name: string; email: string; phone: string | null } | null;
}

/** The page a target points at, to open it from the booking. */
function targetHref(ad: Pick<Ad, "targetType" | "targetSlug">) {
  if (ad.targetType === "HOME" || ad.targetType === "ALL") return "/";
  return ad.targetSlug ? `/${ad.targetSlug}` : null;
}

/** 01712… → 8801712…, for a WhatsApp link. */
function waNumber(phone: string) {
  const bn = "০১২৩৪৫৬৭৮৯";
  const digits = phone.replace(/[০-৯]/g, (d) => String(bn.indexOf(d))).replace(/\D/g, "");
  return digits.startsWith("0") ? `88${digits}` : digits;
}

function fmtDay(iso: string | null, locale: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(locale === "en" ? "en-GB" : "bn-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Dhaka",
  });
}

const PLACEMENTS: Placement[] = ["HEADER", "LEFT", "SIDEBAR", "IN_ARTICLE", "FOOTER", "POPUP"];

// Public API only serves an ad while now ∈ [startsAt, endsAt]. Mirror that here
// so the admin card doesn't show an expired/not-yet-started ad as plainly "Active".
type LiveState = "live" | "expired" | "scheduled";
function liveState(ad: { startsAt: string | null; endsAt: string | null }): LiveState {
  const now = Date.now();
  if (ad.endsAt && new Date(ad.endsAt).getTime() < now) return "expired";
  if (ad.startsAt && new Date(ad.startsAt).getTime() > now) return "scheduled";
  return "live";
}

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand-crimson focus:outline-none focus:ring-2 focus:ring-brand-crimson/15";

const EMPTY = {
  name: "",
  imageUrl: "",
  linkUrl: "",
  placement: "SIDEBAR" as Placement,
  customerPhone: "",
  active: true,
  startsAt: "",
  endsAt: "",
};

export default function AdsAdminPage() {
  const ax = useAdminText();
  const t = useAdminT();
  const L = useBi();
  const { locale } = useLocale();
  const [ads, setAds] = useState<Ad[]>([]);
  const [target, setTarget] = useState<AdTarget>(SITE_WIDE);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const reqId = useRef(0);

  const load = useCallback(() => {
    const id = ++reqId.current;
    apiFetch<{ ads: Ad[] }>("/api/admin/ads")
      .then((d) => {
        if (id === reqId.current) setAds(d.ads);
      })
      .catch(() => {});
  }, []);

  // Reload when anything changes anywhere — a booking approved in another tab
  // or a click on the site shows here without a refresh.
  useEffect(() => {
    load();
    const socket = getSocket();
    socket.on("content:changed", load);
    socket.on("analytics:changed", load);
    // A reader's booking request arrives without a reload.
    socket.on("ads:booked", load);
    return () => {
      socket.off("content:changed", load);
      socket.off("analytics:changed", load);
      socket.off("ads:booked", load);
    };
  }, [load]);

  const set = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const openAdd = () => {
    setError(null);
    setEditId(null);
    setForm(EMPTY);
    setTarget({ ...SITE_WIDE, label: L("পুরো সাইট", "Whole site") });
    setShowForm(true);
  };

  // Edit an existing ad — same form, prefilled. Dates come back as ISO, but the
  // <input type="date"> only accepts YYYY-MM-DD.
  const openEdit = (ad: Ad) => {
    setError(null);
    setEditId(ad.id);
    setForm({
      name: ad.name,
      imageUrl: ad.imageUrl,
      linkUrl: ad.linkUrl,
      placement: ad.placement,
      customerPhone: ad.customerPhone ?? "",
      active: ad.active,
      startsAt: ad.startsAt ? ad.startsAt.slice(0, 10) : "",
      endsAt: ad.endsAt ? ad.endsAt.slice(0, 10) : "",
    });
    setTarget({
      type: ad.targetType,
      slug: ad.targetSlug,
      label: ad.targetLabel ?? "",
      includeArticles: ad.targetIncludesArticles,
    });
    setShowForm(true);
  };

  const pickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      set("imageUrl", await uploadFile(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : ax("আপলোড ব্যর্থ"));
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (!form.name.trim() || !form.linkUrl.trim()) return setError(t("errSave"));
    if (!form.imageUrl) return setError(t("adImageRequired"));
    if (!targetReady(target)) return setError(L("কোন পাতায় দেখাবে তা ঠিক করুন", "Choose the page it runs on"));
    const body = JSON.stringify({
      ...form,
      targetType: target.type,
      targetSlug: target.slug,
      includeArticles: target.includeArticles,
      customerPhone: form.customerPhone.trim() || null,
      startsAt: form.startsAt || null,
      endsAt: form.endsAt || null,
    });
    try {
      await apiFetch(editId ? `/api/admin/ads/${editId}` : "/api/admin/ads", {
        method: editId ? "PUT" : "POST",
        body,
      });
    } catch (err) {
      return setError(err instanceof Error ? err.message : t("errSave"));
    }
    setShowForm(false);
    setEditId(null);
    load();
  };

  const toggleActive = async (ad: Ad) => {
    await apiFetch(`/api/admin/ads/${ad.id}`, {
      method: "PUT",
      body: JSON.stringify({ active: !ad.active }),
    });
    load();
  };

  const setStatus = async (ad: Ad, status: "ACTIVE" | "REJECTED") => {
    setActionError(null);
    try {
      await apiFetch(`/api/admin/ads/${ad.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    } catch (e) {
      // Usually another ad already holding that spot on that page.
      setActionError(e instanceof Error ? e.message : "Error");
    }
    load();
  };

  const requests = ads.filter((a) => a.status === "PENDING");
  const others = ads.filter((a) => a.status !== "PENDING");

  const remove = async (id: string) => {
    await apiFetch(`/api/admin/ads/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-heading">{t("ads")}</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 rounded-lg bg-brand-crimson px-4 py-2.5 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark"
        >
          <Plus className="h-4 w-4" />
          {t("addAd")}
        </button>
      </div>

      {actionError && (
        <p className="mt-4 rounded-lg bg-brand-crimson/10 px-3.5 py-2 font-ui text-sm text-brand-crimson">
          {actionError}
        </p>
      )}

      {requests.length > 0 && (
        <section className="mt-5">
          <h2 className="flex items-center gap-2 font-ui text-sm font-bold uppercase tracking-wide text-foreground-muted">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
            {L("নতুন বুকিং রিকোয়েস্ট", "New booking requests")} ({requests.length})
          </h2>
          <p className="mt-1 font-ui text-xs text-foreground-muted">
            {L(
              "গ্রাহকের সঙ্গে ফোনে কথা বলে বিস্তারিত ও পেমেন্ট নিশ্চিত করুন, তারপর অনুমোদন দিন — অনুমোদনের সাথে সাথে নির্বাচিত পাতায় চালু হবে।",
              "Call the customer to confirm the details and payment, then approve — it goes live on the chosen page at once.",
            )}
          </p>
          <div className="mt-3 flex flex-col gap-3">
            {requests.map((ad) => {
              const phone = ad.customerPhone || ad.account?.phone || null;
              const href = targetHref(ad);
              return (
                <div key={ad.id} className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-background p-4 lg:flex-row">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ad.imageUrl} alt={ad.name} className="h-36 w-full shrink-0 rounded-xl bg-surface object-contain lg:w-64" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-lg font-bold text-heading">{ad.name}</p>
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 font-ui text-xs font-semibold text-amber-700">
                        {t("adPending")}
                      </span>
                    </div>
                    {ad.account && (
                      <p className="font-ui text-xs text-foreground-muted">
                        {ad.account.name} · {ad.account.email}
                      </p>
                    )}

                    <div className="mt-3 grid gap-2 font-ui text-sm sm:grid-cols-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-crimson" />
                        <span className="min-w-0">
                          <span className="block text-[11px] text-foreground-muted">{L("পাতা", "Page")}</span>
                          <span className="block text-foreground">{targetText(ad, L)}</span>
                          {href && (
                            <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-brand-crimson hover:underline">
                              {L("পাতাটি দেখুন", "Open the page")} <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <PlacementDiagram placement={ad.placement} active />
                        <span>
                          <span className="block text-[11px] text-foreground-muted">{L("পাতার কোথায়", "Where on the page")}</span>
                          <span className="block text-foreground">{placementLabel(ad.placement, L)}</span>
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-brand-crimson" />
                        <span>
                          <span className="block text-[11px] text-foreground-muted">{L("সময়", "Period")}</span>
                          <span className="block text-foreground">
                            {ad.days} {L("দিন", "days")} · {fmtDay(ad.startsAt, locale)} — {fmtDay(ad.endsAt, locale)}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5 font-bold text-brand-crimson">{ax("৳")}</span>
                        <span>
                          <span className="block text-[11px] text-foreground-muted">{L("মোট মূল্য", "Total")}</span>
                          <span className="block font-semibold text-foreground">{ax("৳")}{ad.amount.toLocaleString("en-US")}</span>
                        </span>
                      </div>
                    </div>
                    <a href={ad.linkUrl} target="_blank" rel="noreferrer nofollow" className="mt-2 block truncate font-ui text-xs text-foreground-muted hover:text-brand-crimson">
                      {L("লিংক", "Link")}: {ad.linkUrl}
                    </a>

                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                      {phone ? (
                        <>
                          <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 rounded-lg bg-brand-navy px-3 py-1.5 font-ui text-xs font-semibold text-white hover:opacity-90">
                            <Phone className="h-3.5 w-3.5" /> {phone}
                          </a>
                          <a href={`https://wa.me/${waNumber(phone)}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-1.5 font-ui text-xs font-semibold text-white hover:opacity-90">
                            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                          </a>
                        </>
                      ) : (
                        <span className="font-ui text-xs text-foreground-muted">{L("নম্বর দেওয়া হয়নি", "No number given")}</span>
                      )}
                      <span className="flex-1" />
                      <button onClick={() => openEdit(ad)} title={t("edit")} className="rounded-lg border border-border p-1.5 text-foreground-muted hover:bg-surface hover:text-brand-navy">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setStatus(ad, "REJECTED")} className="rounded-lg border border-border px-3 py-1.5 font-ui text-xs font-semibold text-foreground hover:bg-surface">
                        {t("adReject")}
                      </button>
                      <button onClick={() => setStatus(ad, "ACTIVE")} className="rounded-lg bg-green-600 px-3.5 py-1.5 font-ui text-xs font-semibold text-white hover:bg-green-700">
                        {L("অনুমোদন ও চালু", "Approve & go live")}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {others.length === 0 && requests.length === 0 ? (
          <p className="col-span-full rounded-xl border border-border bg-background p-6 text-center font-ui text-sm text-foreground-muted">
            {t("noAds")}
          </p>
        ) : (
          others.map((ad) => (
            <div key={ad.id} className="overflow-hidden rounded-xl border border-border bg-background">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ad.imageUrl} alt={ad.name} className="h-32 w-full object-cover" />
              <div className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 truncate font-semibold text-foreground">{ad.name}</p>
                  <span className="shrink-0 rounded bg-brand-navy/10 px-1.5 py-0.5 font-ui text-[11px] font-semibold text-brand-navy">
                    {placementLabel(ad.placement, L)}
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1 truncate font-ui text-xs text-foreground-muted">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {targetText(ad, L)}
                  {ad.customerPhone && <> · <Phone className="h-3 w-3" /> {ad.customerPhone}</>}
                </p>
                <div className="mt-2 flex items-center gap-3 font-ui text-xs text-foreground-muted">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" /> {ad.impressions}
                  </span>
                  <span className="flex items-center gap-1">
                    <MousePointerClick className="h-3.5 w-3.5" /> {ad.clicks}
                  </span>
                  <span>
                    {ad.impressions > 0
                      ? ((ad.clicks / ad.impressions) * 100).toFixed(1)
                      : "0.0"}
                    % {t("dashCtr")}
                  </span>
                </div>
                {ad.account && (
                  <p className="mt-2 font-ui text-xs text-foreground-muted">
                    {t("adAdvertiser")}: {ad.account.name} · {ax("৳")}
                    {ad.amount.toLocaleString("en-US")} / {ad.days}d
                  </p>
                )}
                {ad.status === "PENDING" ? (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 font-ui text-xs font-semibold text-amber-700">
                      {t("adPending")}
                    </span>
                    <button
                      onClick={() => setStatus(ad, "ACTIVE")}
                      className="ml-auto rounded-lg bg-green-600 px-3 py-1.5 font-ui text-xs font-semibold text-white hover:bg-green-700"
                    >
                      {t("adApprove")}
                    </button>
                    <button
                      onClick={() => setStatus(ad, "REJECTED")}
                      className="rounded-lg border border-border px-3 py-1.5 font-ui text-xs font-semibold text-foreground hover:bg-surface"
                    >
                      {t("adReject")}
                    </button>
                    <button
                      onClick={() => openEdit(ad)}
                      title={t("edit")}
                      className="rounded p-1.5 text-foreground-muted hover:bg-surface hover:text-brand-navy"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center justify-between">
                    {(() => {
                      const state = liveState(ad);
                      const showsPublicly =
                        ad.active && ad.status === "ACTIVE" && state === "live";
                      const label =
                        ad.status === "REJECTED"
                          ? t("adReject")
                          : !ad.active
                            ? t("draftLabel")
                            : state === "expired"
                              ? t("adExpired")
                              : state === "scheduled"
                                ? t("adScheduled")
                                : t("adActive");
                      return (
                        <button
                          onClick={() => toggleActive(ad)}
                          title={state === "expired" ? t("adNotShowing") : undefined}
                          className={`rounded-full px-2.5 py-1 font-ui text-xs font-semibold ${
                            showsPublicly
                              ? "bg-green-100 text-green-700"
                              : state === "expired"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-surface text-foreground-muted"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })()}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(ad)}
                        title={t("edit")}
                        className="rounded p-1.5 text-foreground-muted hover:bg-surface hover:text-brand-navy"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(ad.id)}
                        title={t("delete")}
                        className="rounded p-1.5 text-foreground-muted hover:bg-surface hover:text-brand-crimson"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <Modal
          wide
          title={editId ? t("edit") : t("addAd")}
          onClose={() => {
            setShowForm(false);
            setEditId(null);
          }}
        >
          <div className="flex max-h-[72vh] flex-col gap-3 overflow-y-auto pr-1">
            {error && (
              <p className="rounded-lg bg-brand-crimson/10 px-3 py-2 font-ui text-sm text-brand-crimson">
                {error}
              </p>
            )}
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder={t("adName")}
              className={inputCls}
            />
            <input
              value={form.linkUrl}
              onChange={(e) => set("linkUrl", e.target.value)}
              placeholder={t("adLink")}
              className={inputCls}
            />
            <div>
              <label className="font-ui text-xs font-semibold text-foreground-muted">
                {t("adImage")}
              </label>
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-ui text-sm text-foreground hover:bg-surface disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? t("uploadingPdf") : t("adImage")}
                </button>
                {form.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.imageUrl} alt="" className="h-10 w-16 rounded object-cover" />
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={pickImage}
                  className="hidden"
                />
              </div>
            </div>
            <input
              value={form.customerPhone}
              onChange={(e) => set("customerPhone", e.target.value)}
              placeholder={L("গ্রাহকের মোবাইল নম্বর (ঐচ্ছিক)", "Customer mobile (optional)")}
              className={inputCls}
            />
            <div>
              <label className="font-ui text-xs font-semibold text-foreground-muted">
                {L("কোন পাতায় দেখাবে", "Which page")}
              </label>
              <div className="mt-1">
                <TargetPicker value={target} onChange={setTarget} />
              </div>
            </div>
            <div>
              <label className="font-ui text-xs font-semibold text-foreground-muted">
                {t("adPlacement")}
              </label>
              <div className="mt-1">
                <PlacementPicker
                  slots={PLACEMENTS.map((p) => ({ placement: p }))}
                  value={form.placement}
                  onChange={(p) => set("placement", p)}
                />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="font-ui text-xs font-semibold text-foreground-muted">
                  {t("adStartsAt")}
                </label>
                <input
                  type="date"
                  value={form.startsAt}
                  onChange={(e) => set("startsAt", e.target.value)}
                  className={`${inputCls} mt-1`}
                />
              </div>
              <div className="flex-1">
                <label className="font-ui text-xs font-semibold text-foreground-muted">
                  {t("adEndsAt")}
                </label>
                <input
                  type="date"
                  value={form.endsAt}
                  onChange={(e) => set("endsAt", e.target.value)}
                  className={`${inputCls} mt-1`}
                />
              </div>
            </div>
            <p className="-mt-1 font-ui text-xs text-foreground-muted">
              {t("adRunsForever")}
            </p>
            <label className="flex items-center gap-2 font-ui text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => set("active", e.target.checked)}
                className="h-4 w-4 accent-brand-crimson"
              />
              {t("adActive")}
            </label>
            <div className="mt-1 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditId(null);
                }}
                className="rounded-lg border border-border px-4 py-2 font-ui text-sm text-foreground hover:bg-surface"
              >
                {t("cancel")}
              </button>
              <button
                onClick={submit}
                disabled={uploading}
                className="rounded-lg bg-brand-crimson px-4 py-2 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark disabled:opacity-50"
              >
                {t("save")}
              </button>
            </div>
          </div>
        </Modal>
      )}

      <AdReport />

      {deleteId && (
        <ConfirmModal
          title={t("deleteTitle")}
          message={t("deleteMessage")}
          onConfirm={() => remove(deleteId)}
          onClose={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}
