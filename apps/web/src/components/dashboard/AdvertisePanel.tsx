"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BarChart3,
  Eye,
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

type Placement = "HEADER" | "SIDEBAR" | "IN_ARTICLE" | "FOOTER" | "POPUP";

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
  const [slots, setSlots] = useState<Slot[]>([]);
  const [ads, setAds] = useState<MyAd[]>([]);
  const [booking, setBooking] = useState<Slot | null>(null);
  const [payFor, setPayFor] = useState<MyAd | null>(null);
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
              <span className="font-semibold text-foreground">
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
                  ৳{s.pricePerDay.toLocaleString("en-US")}
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
                        {t(`adPlace${ad.placement}` as TranslationKey)}
                      </span>
                    </div>
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
                        ৳{ad.amount.toLocaleString("en-US")} · {ad.days}d
                      </span>
                    </div>
                  </div>
                  {ad.status === "PENDING" && (
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => setPayFor(ad)}
                        className="rounded-lg bg-brand-crimson px-3.5 py-2 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark"
                      >
                        {t("payNow")}
                      </button>
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
          onClose={() => setBooking(null)}
          onBooked={(ad) => {
            setBooking(null);
            loadAds();
            setPayFor(ad);
          }}
        />
      )}

      {payFor && <PaymentModal ad={payFor} onClose={() => setPayFor(null)} />}
    </div>
  );
}

// --- Booking modal ---
function BookingModal({
  slot,
  onClose,
  onBooked,
}: {
  slot: Slot;
  onClose: () => void;
  onBooked: (ad: MyAd) => void;
}) {
  const { t } = useLocale();
  const [name, setName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [days, setDays] = useState(7);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const total = slot.pricePerDay * (days || 0);
  const inputCls =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand-crimson focus:outline-none focus:ring-2 focus:ring-brand-crimson/15";

  const pickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_BASE}/api/account/upload`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "upload failed");
      setImageUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    setError(null);
    if (!imageUrl) return setError(t("bannerRequired"));
    if (!linkUrl.trim() || !days) return;
    setBusy(true);
    try {
      const d = await apiFetch<{ ad: MyAd }>("/api/account/ads", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim() || undefined,
          placement: slot.placement,
          imageUrl,
          linkUrl: linkUrl.trim(),
          days,
        }),
      });
      onBooked(d.ad);
    } catch (err) {
      setError(err instanceof Error ? err.message : "failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Overlay onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-heading">{t("bookAdTitle")}</h3>
        <button onClick={onClose} aria-label="close" className="text-foreground-muted hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>
      <p className="mt-1 font-ui text-sm text-foreground-muted">
        {t(`adPlace${slot.placement}` as TranslationKey)} · {t("recommendedSize")} {slot.size}
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {error && (
          <p className="rounded-lg bg-brand-crimson/10 px-3 py-2 font-ui text-sm text-brand-crimson">
            {error}
          </p>
        )}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("adCampaignName")}
          className={inputCls}
        />
        <input
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          placeholder={t("adLinkUrl")}
          className={inputCls}
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 font-ui text-sm text-foreground hover:bg-surface disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {t("adBannerUpload")}
          </button>
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="h-10 w-20 rounded object-cover" />
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={pickImage}
            className="hidden"
          />
        </div>
        <div>
          <label className="font-ui text-xs font-semibold text-foreground-muted">
            {t("adDays")}
          </label>
          <input
            type="number"
            min={1}
            max={365}
            value={days}
            onChange={(e) => setDays(Math.max(1, Number(e.target.value) || 1))}
            className={`${inputCls} mt-1`}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg bg-surface px-4 py-3">
          <span className="font-ui text-sm text-foreground-muted">{t("adTotal")}</span>
          <span className="text-xl font-bold text-brand-crimson">
            ৳{total.toLocaleString("en-US")}
          </span>
        </div>
        <button
          onClick={submit}
          disabled={busy || uploading}
          className="rounded-lg bg-brand-crimson py-2.5 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark disabled:opacity-60"
        >
          {t("confirmBooking")}
        </button>
      </div>
    </Overlay>
  );
}

// --- Payment (gateway pending) modal ---
function PaymentModal({ ad, onClose }: { ad: MyAd; onClose: () => void }) {
  const { t } = useLocale();
  return (
    <Overlay onClose={onClose}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-heading">{t("paymentComingTitle")}</h3>
        <button onClick={onClose} aria-label="close" className="text-foreground-muted hover:text-foreground">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-4 flex items-center justify-between rounded-lg bg-surface px-4 py-3">
        <span className="font-ui text-sm text-foreground-muted">{t("amountDue")}</span>
        <span className="text-xl font-bold text-brand-crimson">
          ৳{ad.amount.toLocaleString("en-US")}
        </span>
      </div>
      <p className="mt-4 font-ui text-sm leading-relaxed text-foreground-muted">
        {t("paymentComingCopy")}
      </p>
      <button
        onClick={onClose}
        className="mt-5 w-full rounded-lg border border-border py-2.5 font-ui text-sm font-medium text-foreground hover:bg-surface"
      >
        {t("close")}
      </button>
    </Overlay>
  );
}

function Overlay({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl"
      >
        {children}
      </div>
    </div>
  );
}
