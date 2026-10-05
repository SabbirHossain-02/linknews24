"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  Eye,
  MapPin,
  Phone,
  Megaphone,
  MousePointerClick,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { apiFetch, API_BASE } from "@/lib/admin-api";
import { getSocket } from "@/lib/socket";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { TranslationKey } from "@/lib/i18n";
import { useAuth } from "@/components/providers/AuthProvider";
import type { AdPlacement } from "@/components/ads/AdSlot";
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

type Placement = AdPlacement;

interface Slot {
  placement: Placement;
  pricePerDay: number;
  size: string;
}

interface MyAd {
  id: string;
  name: string;
  imageUrl: string;
  linkUrl: string;
  placement: Placement;
  targetType?: TargetType;
  targetLabel?: string | null;
  targetIncludesArticles?: boolean;
  customerPhone?: string | null;
  status: "PENDING" | "ACTIVE" | "REJECTED" | "EXPIRED";
  amount: number;
  days: number;
  paid: boolean;
  impressions: number;
  clicks: number;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
}

const STATUS_STYLE: Record<MyAd["status"], string> = {
  PENDING: "bg-amber-100 text-amber-700",
  ACTIVE: "bg-green-100 text-green-700",
  REJECTED: "bg-brand-crimson/10 text-brand-crimson",
  EXPIRED: "bg-surface text-foreground-muted",
};

export function AdvertisePanel() {
  const { t } = useLocale();
  const L = useBi();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [ads, setAds] = useState<MyAd[]>([]);
  const [booking, setBooking] = useState<Slot | null>(null);
  const [sent, setSent] = useState<MyAd | null>(null);
  const reqId = useRef(0);

  const loadAds = useCallback(() => {
    const id = ++reqId.current;
    apiFetch<{ ads: MyAd[] }>("/api/account/ads")
      .then((d) => {
        if (id === reqId.current) setAds(d.ads);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/ad-slots`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots ?? []))
      .catch(() => {});
    loadAds();
    const socket = getSocket();
    socket.on("analytics:changed", loadAds);
    return () => {
      socket.off("analytics:changed", loadAds);
    };
  }, [loadAds]);

  const cancel = async (id: string) => {
    await apiFetch(`/api/account/ads/${id}`, { method: "DELETE" });
    loadAds();
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Slot catalogue */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-bold text-heading">
          <Megaphone className="h-5 w-5 text-brand-crimson" />
          {t("adSlotsTitle")}
        </h2>
        <p className="mt-1 font-ui text-sm text-foreground-muted">
          {t("adSlotsSubtitle")}
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {slots.map((s) => (
            <div
              key={s.placement}
              className="flex flex-col rounded-xl border border-border bg-background p-4"
            >
              <span className="flex items-center gap-2.5 font-semibold text-foreground">
                <PlacementDiagram placement={s.placement} />
                {t(`adPlace${s.placement}` as TranslationKey)}
              </span>
              <span className="mt-0.5 font-ui text-xs text-foreground-muted">
                {t(`adDesc${s.placement}` as TranslationKey)}
              </span>
              <span className="mt-2 font-ui text-[11px] text-foreground-muted">
                {t("recommendedSize")}: {s.size}
              </span>
              <div className="mt-3 flex items-end justify-between">
                <span className="text-xl font-bold text-brand-crimson">
                  {t("currencySymbol")}
                  {s.pricePerDay.toLocaleString("en-US")}
                  <span className="font-ui text-xs font-normal text-foreground-muted">
                    {t("perDay")}
                  </span>
                </span>
                <button
                  onClick={() => setBooking(s)}
                  className="rounded-lg bg-brand-crimson px-3.5 py-2 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark"
                >
                  {t("bookSlot")}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* My ads */}
      <section>
        <h2 className="flex items-center gap-2 text-lg font-bold text-heading">
          <BarChart3 className="h-5 w-5 text-brand-crimson" />
          {t("myAds")}
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          {ads.length === 0 ? (
            <p className="rounded-xl border border-border bg-background p-6 text-center font-ui text-sm text-foreground-muted">
              {t("noMyAds")}
            </p>
          ) : (
            ads.map((ad) => {
              const ctr =
                ad.impressions > 0
                  ? ((ad.clicks / ad.impressions) * 100).toFixed(1)
                  : "0.0";
              return (
                <div
                  key={ad.id}
                  className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 sm:flex-row sm:items-center"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={ad.imageUrl}
                    alt={ad.name}
                    className="h-16 w-28 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground">{ad.name}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 font-ui text-[11px] font-semibold ${STATUS_STYLE[ad.status]}`}
                      >
                        {t(`adStatus${ad.status}` as TranslationKey)}
                      </span>
                      <span className="rounded bg-brand-navy/10 px-1.5 py-0.5 font-ui text-[11px] font-semibold text-brand-navy">
                        {placementLabel(ad.placement, L)}
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1 font-ui text-xs text-foreground-muted">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{targetText(ad, L)}</span>
                    </p>
                    {ad.status === "PENDING" && (
                      <p className="mt-1 flex items-center gap-1 font-ui text-xs text-amber-700">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        {L(
                          `যাচাই চলছে — আমরা ${ad.customerPhone ?? "আপনার"} নম্বরে যোগাযোগ করব`,
                          `Under review — we will call ${ad.customerPhone ?? "you"}`,
                        )}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-4 font-ui text-xs text-foreground-muted">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" /> {ad.impressions} {t("adViews")}
                      </span>
                      <span className="flex items-center gap-1">
                        <MousePointerClick className="h-3.5 w-3.5" /> {ad.clicks}{" "}
                        {t("adClicksLabel")}
                      </span>
                      <span>CTR {ctr}%</span>
                      <span>
                        {t("currencySymbol")}
                        {ad.amount.toLocaleString("en-US")} · {ad.days}d
                      </span>
                    </div>
                  </div>
                  {ad.status === "PENDING" && (
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => cancel(ad.id)}
                        title={t("cancelBooking")}
                        className="rounded p-1.5 text-foreground-muted hover:bg-surface hover:text-brand-crimson"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {booking && (
        <BookingModal
          slot={booking}
          slots={slots}
          onClose={() => setBooking(null)}
          onBooked={(ad) => {
            setBooking(null);
            loadAds();
            setSent(ad);
          }}
        />
      )}

      {sent && <SentModal ad={sent} onClose={() => setSent(null)} />}
    </div>
  );
}

// XHR upload with progress (fetch can't report upload progress).
function uploadWithProgress(
  file: File,
  onProgress: (pct: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append("file", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/api/account/upload`);
    xhr.withCredentials = true;
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) resolve(data.url);
        else reject(new Error(data?.error || "upload failed"));
      } catch {
        reject(new Error("upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("upload failed"));
    xhr.send(fd);
  });
}

const isVideoUrl = (u: string) => /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(u);

function fmtDateTime(iso: string, locale: string) {
  return new Date(iso).toLocaleString(locale === "bn" ? "bn-BD" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// --- Booking request ---
/**
 * The booking request: what the ad is, where it runs (which page or pages,
 * and where on the page), for how many days, and a number to call. It goes to
 * the newsroom as a request; they call, agree the details, and approve it —
 * only then does it go live.
 */
function BookingModal({
  slot,
  slots,
  onClose,
  onBooked,
}: {
  slot: Slot;
  slots: Slot[];
  onClose: () => void;
  onBooked: (ad: MyAd) => void;
}) {
  const { t, locale } = useLocale();
  const { user } = useAuth();
  const L = useBi();
  const [name, setName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [placement, setPlacement] = useState<Placement>(slot.placement);
  const [target, setTarget] = useState<AdTarget>({ ...SITE_WIDE, label: L("পুরো সাইট", "Whole site") });
  const [startDate, setStartDate] = useState(todayInDhaka());
  const [days, setDays] = useState(7);
  const [progress, setProgress] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booked, setBooked] = useState<{ startsAt: string; endsAt: string }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // The account's own number, if it has one, as a starting point.
  useEffect(() => {
    const p = (user as { phone?: string | null } | null)?.phone;
    if (p) setPhone((cur) => cur || p);
  }, [user]);

  // When this spot on this page is already taken.
  useEffect(() => {
    if (!targetReady(target)) return setBooked([]);
    const q = new URLSearchParams({ placement, targetType: target.type });
    if (target.slug) q.set("targetSlug", target.slug);
    apiFetch<{ ranges: { startsAt: string; endsAt: string }[] }>(
      `/api/account/slot-booked?${q.toString()}`,
    )
      .then((d) => setBooked(d.ranges.filter((r) => r.startsAt && r.endsAt)))
      .catch(() => setBooked([]));
  }, [placement, target]);

  const current = slots.find((s) => s.placement === placement) ?? slot;
  const total = current.pricePerDay * days;

  const inputCls =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand-crimson focus:outline-none focus:ring-2 focus:ring-brand-crimson/15";
  const label = "font-ui text-xs font-semibold text-foreground-muted";

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    setProgress(0);
    try {
      setMediaUrl(await uploadWithProgress(file, setProgress));
    } catch (err) {
      setError(err instanceof Error ? err.message : "upload failed");
    } finally {
      setProgress(null);
    }
  };

  const submit = async () => {
    setError(null);
    if (!name.trim()) return setError(L("বিজ্ঞাপনের একটি নাম দিন", "Give the ad a name"));
    if (!/^https?:\/\/\S+$/i.test(linkUrl.trim()))
      return setError(L("লিংক https:// দিয়ে শুরু হতে হবে", "The link must start with https://"));
    if (!mediaUrl) return setError(t("bannerRequired"));
    if (!/^\+?[0-9০-৯][0-9০-৯\s-]{7,18}$/.test(phone.trim()))
      return setError(L("যোগাযোগের জন্য সঠিক মোবাইল নম্বর দিন", "Enter a valid mobile number to contact you"));
    if (!targetReady(target))
      return setError(L("কোন পাতায় দেখাবে তা ঠিক করুন", "Choose the page it runs on"));
    setBusy(true);
    try {
      const d = await apiFetch<{ ad: MyAd }>("/api/account/ads", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          placement,
          imageUrl: mediaUrl,
          linkUrl: linkUrl.trim(),
          phone: phone.trim(),
          targetType: target.type,
          targetSlug: target.slug,
          includeArticles: target.includeArticles,
          days,
          startDate,
        }),
      });
      onBooked(d.ad);
    } catch (err) {
      const body = (err as { data?: { availableFrom?: string } }).data;
      if (body?.availableFrom) {
        setError(`${t("slotBookedNote")} ${fmtDateTime(body.availableFrom, locale)}`);
      } else {
        setError(err instanceof Error ? err.message : "failed");
      }
    } finally {
      setBusy(false);
    }
  };

  const step = (n: number, title: string) => (
    <h4 className="flex items-center gap-2 font-ui text-sm font-bold text-heading">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-crimson font-ui text-xs text-white">
        {n}
      </span>
      {title}
    </h4>
  );

  return (
    <Overlay onClose={onClose} wide>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-heading">{t("bookAdTitle")}</h3>
        <button onClick={onClose} aria-label="close" className="text-foreground-muted hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>
      <p className="mt-1 font-ui text-sm text-foreground-muted">
        {L(
          "রিকোয়েস্ট পাঠানোর পর আমাদের টিম আপনার নম্বরে যোগাযোগ করবে; অনুমোদনের পর বিজ্ঞাপন চালু হবে।",
          "After you send the request our team will call you; the ad goes live once approved.",
        )}
      </p>

      <div className="mt-4 max-h-[72vh] overflow-y-auto pr-1">
        <div className="flex flex-col gap-5">
          {/* 1 — the ad */}
          <section className="flex flex-col gap-3">
            {step(1, L("বিজ্ঞাপনের তথ্য", "The ad"))}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={label}>{L("বিজ্ঞাপনের নাম", "Ad name")}</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("adCampaignName")} className={`${inputCls} mt-1`} />
              </div>
              <div>
                <label className={label}>{L("যোগাযোগের মোবাইল নম্বর", "Contact mobile number")}</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  placeholder="01XXXXXXXXX"
                  className={`${inputCls} mt-1`}
                />
              </div>
            </div>
            <div>
              <label className={label}>{L("ক্লিক করলে যে লিংকে যাবে", "Link the ad opens")}</label>
              <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://" className={`${inputCls} mt-1`} />
            </div>
            <div>
              <label className={label}>{L("ব্যানার (ছবি বা ভিডিও)", "Banner (image or video)")}</label>
              <div className="mt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={progress !== null}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-ui text-sm text-foreground hover:bg-surface disabled:opacity-50"
                >
                  <Upload className="h-4 w-4" />
                  {progress !== null ? t("uploadingLabel") : t("uploadCreative")}
                </button>
                {mediaUrl &&
                  (isVideoUrl(mediaUrl) ? (
                    <video src={mediaUrl} className="h-10 w-20 rounded object-cover" muted />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl} alt="" className="h-10 w-20 rounded object-cover" />
                  ))}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp,video/mp4,video/webm"
                  onChange={pick}
                  className="hidden"
                />
              </div>
              <p className="mt-1 font-ui text-[11px] text-foreground-muted">
                {t("bannerLabel")}: {current.size} · {t("videoNote")}
              </p>
              {progress !== null && (
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                  <div className="h-full rounded-full bg-brand-crimson transition-all" style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>
          </section>

          {/* 2 — where */}
          <section className="flex flex-col gap-3">
            {step(2, L("কোন পাতায় দেখাবে", "Which page"))}
            <TargetPicker value={target} onChange={setTarget} />
            <h5 className={label}>{L("পাতার কোথায়", "Where on the page")}</h5>
            <PlacementPicker slots={slots} value={placement} onChange={setPlacement} currency={t("currencySymbol")} />
          </section>

          {/* 3 — how long */}
          <section className="flex flex-col gap-3">
            {step(3, L("কতদিন চলবে", "How long"))}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={label}>{L("শুরুর তারিখ", "Start date")}</label>
                <input
                  type="date"
                  value={startDate}
                  min={todayInDhaka()}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`${inputCls} mt-1`}
                />
              </div>
              <div>
                <label className={label}>{L("কত দিন", "Number of days")}</label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={days}
                  onChange={(e) => setDays(Math.min(365, Math.max(1, Number(e.target.value) || 1)))}
                  className={`${inputCls} mt-1`}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[3, 7, 15, 30, 60, 90].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setDays(n)}
                  className={`rounded-full border px-3 py-1 font-ui text-xs font-semibold ${
                    days === n ? "border-brand-crimson bg-brand-crimson text-white" : "border-border text-foreground hover:border-brand-crimson"
                  }`}
                >
                  {n} {L("দিন", "days")}
                </button>
              ))}
            </div>
            {booked.length === 0 ? (
              <p className="rounded-lg bg-green-50 px-3 py-2 font-ui text-xs text-green-700">{t("slotFreeNote")}</p>
            ) : (
              <div className="rounded-lg bg-amber-50 px-3 py-2 font-ui text-xs text-amber-800">
                <p className="font-semibold">{t("bookedPeriods")}:</p>
                <ul className="mt-1 space-y-0.5">
                  {booked.map((r, i) => (
                    <li key={i}>
                      {fmtDateTime(r.startsAt, locale)} — {fmtDateTime(r.endsAt, locale)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Summary */}
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-3">
              <PlacementDiagram placement={placement} active />
              <div className="min-w-0 flex-1 font-ui text-xs text-foreground-muted">
                <p className="font-semibold text-foreground">
                  {targetText({ targetType: target.type, targetLabel: target.label, targetIncludesArticles: target.includeArticles }, L)}
                </p>
                <p>
                  {placementLabel(placement, L)} · {days} {L("দিন", "days")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-ui text-[11px] text-foreground-muted">{t("adTotal")}</p>
                <p className="text-xl font-bold text-brand-crimson">
                  {t("currencySymbol")}
                  {total.toLocaleString("en-US")}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-brand-crimson/10 px-3 py-2 font-ui text-sm text-brand-crimson">{error}</p>
          )}
          <button
            onClick={submit}
            disabled={busy || progress !== null}
            className="rounded-lg bg-brand-crimson py-3 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark disabled:opacity-60"
          >
            {busy ? L("পাঠানো হচ্ছে…", "Sending…") : L("বুকিং রিকোয়েস্ট পাঠান", "Send booking request")}
          </button>
        </div>
      </div>
    </Overlay>
  );
}

/** Today's date in Dhaka, as YYYY-MM-DD for a date input. */
function todayInDhaka() {
  return new Date(Date.now() + 6 * 3600 * 1000).toISOString().slice(0, 10);
}

// --- Sent ---
function SentModal({ ad, onClose }: { ad: MyAd; onClose: () => void }) {
  const { t } = useLocale();
  const L = useBi();
  return (
    <Overlay onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="mt-3 text-lg font-bold text-heading">
          {L("বুকিং রিকোয়েস্ট পাঠানো হয়েছে", "Booking request sent")}
        </h3>
        <p className="mt-2 font-ui text-sm leading-relaxed text-foreground-muted">
          {L(
            `আমাদের টিম শীঘ্রই ${ad.customerPhone ?? ""} নম্বরে যোগাযোগ করবে। অনুমোদনের পর বিজ্ঞাপনটি নির্বাচিত পাতায় চালু হবে।`,
            `Our team will call ${ad.customerPhone ?? ""} shortly. Once approved, the ad goes live on the chosen page.`,
          )}
        </p>
        <div className="mt-4 flex w-full items-center justify-between rounded-lg bg-surface px-4 py-3">
          <span className="font-ui text-sm text-foreground-muted">{t("amountDue")}</span>
          <span className="text-xl font-bold text-brand-crimson">
            {t("currencySymbol")}
            {ad.amount.toLocaleString("en-US")}
          </span>
        </div>
        <button
          onClick={onClose}
          className="mt-5 w-full rounded-lg border border-border py-2.5 font-ui text-sm font-medium text-foreground hover:bg-surface"
        >
          {t("close")}
        </button>
      </div>
    </Overlay>
  );
}

function Overlay({
  children,
  onClose,
  wide,
}: {
  children: React.ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${wide ? "max-w-2xl" : "max-w-md"} rounded-2xl bg-background p-6 shadow-2xl`}
      >
        {children}
      </div>
    </div>
  );
}
