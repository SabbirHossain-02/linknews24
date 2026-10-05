"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, FileText, Globe, Home, Link2, Loader2, Tags } from "lucide-react";
import { API_BASE } from "@/lib/admin-api";
import { useLocale } from "@/components/providers/LocaleProvider";
import { AD_FRAMES, type AdPlacement } from "./AdSlot";

/**
 * Where an ad runs: the page(s), and the spot on the page. Shared by the
 * advertiser's booking form and the admin's ad form, so both describe a
 * booking the same way. Strings are inline Bengali/English pairs because the
 * component serves both the public site and the admin panel.
 */

export type TargetType = "ALL" | "HOME" | "CATEGORY" | "ARTICLE";

export interface AdTarget {
  type: TargetType;
  slug: string | null;
  /** What the page is called, for showing the choice back. */
  label: string;
  includeArticles: boolean;
}

export const SITE_WIDE: AdTarget = { type: "ALL", slug: null, label: "", includeArticles: false };

function useBi() {
  const { locale } = useLocale();
  return (bn: string, en: string) => (locale === "en" ? en : bn);
}

interface Category {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
}

const pill =
  "flex items-center gap-2.5 rounded-xl border-2 px-3.5 py-3 text-left transition-colors";
const inputCls =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-brand-crimson focus:outline-none focus:ring-2 focus:ring-brand-crimson/15";

/** Which page(s): the whole site, the homepage, a category, or one page by its link. */
export function TargetPicker({
  value,
  onChange,
}: {
  value: AdTarget;
  onChange: (t: AdTarget) => void;
}) {
  const L = useBi();
  const { locale } = useLocale();
  const [cats, setCats] = useState<Category[]>([]);
  const [mode, setMode] = useState<"ALL" | "HOME" | "CATEGORY" | "LINK">(
    value.type === "ARTICLE" ? "LINK" : value.type,
  );
  const [url, setUrl] = useState("");
  const [resolving, setResolving] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/categories`)
      .then((r) => r.json())
      .then((d) => setCats(d.categories ?? []))
      .catch(() => {});
  }, []);

  const catName = (c: Category) => (locale === "en" ? c.nameEn || c.name : c.name);

  // Categories arriving after "one category" was picked: start on the first.
  useEffect(() => {
    if (mode === "CATEGORY" && !value.slug && cats[0])
      onChange({ type: "CATEGORY", slug: cats[0].slug, label: catName(cats[0]), includeArticles: true });
  }, [cats, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (m: typeof mode) => {
    setMode(m);
    setLinkError(null);
    if (m === "ALL") onChange({ ...SITE_WIDE, label: L("পুরো সাইট", "Whole site") });
    if (m === "HOME") onChange({ type: "HOME", slug: null, label: L("হোমপেজ", "Homepage"), includeArticles: false });
    if (m === "CATEGORY") {
      const c = cats.find((x) => x.slug === value.slug) ?? cats[0];
      onChange({
        type: "CATEGORY",
        slug: c?.slug ?? null,
        label: c ? catName(c) : "",
        includeArticles: value.type === "CATEGORY" ? value.includeArticles : true,
      });
    }
    if (m === "LINK") onChange({ type: "ARTICLE", slug: null, label: "", includeArticles: false });
  };

  // A pasted link is looked up as soon as it looks complete.
  useEffect(() => {
    if (mode !== "LINK" || !url.trim()) return;
    const id = setTimeout(() => {
      setResolving(true);
      setLinkError(null);
      fetch(`${API_BASE}/api/ads/resolve-target?url=${encodeURIComponent(url.trim())}`)
        .then(async (r) => {
          const d = await r.json();
          if (!r.ok) throw new Error(d.error);
          onChange({
            type: d.type,
            slug: d.slug,
            label: locale === "en" ? d.labelEn : d.label,
            includeArticles: d.type === "CATEGORY",
          });
        })
        .catch((e) => {
          setLinkError(e.message || L("লিংকটি চেনা যায়নি", "That link was not recognised"));
          onChange({ type: "ARTICLE", slug: null, label: "", includeArticles: false });
        })
        .finally(() => setResolving(false));
    }, 450);
    return () => clearTimeout(id);
  }, [url, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const options = [
    { key: "ALL" as const, icon: Globe, title: L("পুরো সাইট", "Whole site"), sub: L("সব পাতায়", "Every page") },
    { key: "HOME" as const, icon: Home, title: L("হোমপেজ", "Homepage"), sub: L("শুধু প্রথম পাতায়", "Front page only") },
    { key: "CATEGORY" as const, icon: Tags, title: L("একটি বিভাগ", "One category"), sub: L("যেমন: খেলাধুলা", "e.g. Sports") },
    { key: "LINK" as const, icon: Link2, title: L("নির্দিষ্ট পাতা", "A specific page"), sub: L("পাতার লিংক দিয়ে", "By its link") },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2">
        {options.map(({ key, icon: Icon, title, sub }) => {
          const on = mode === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => choose(key)}
              className={`${pill} ${on ? "border-brand-crimson bg-brand-crimson/[0.05]" : "border-border hover:border-brand-crimson/40"}`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  on ? "bg-brand-crimson text-white" : "bg-surface text-foreground-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block font-ui text-sm font-semibold text-heading">{title}</span>
                <span className="block font-ui text-[11px] text-foreground-muted">{sub}</span>
              </span>
            </button>
          );
        })}
      </div>

      {mode === "CATEGORY" && (
        <div className="flex flex-col gap-2 rounded-xl bg-surface p-3">
          <select
            value={value.slug ?? ""}
            onChange={(e) => {
              const c = cats.find((x) => x.slug === e.target.value);
              if (c) onChange({ type: "CATEGORY", slug: c.slug, label: catName(c), includeArticles: value.includeArticles });
            }}
            className={inputCls}
          >
            {cats.map((c) => (
              <option key={c.id} value={c.slug}>
                {catName(c)}
              </option>
            ))}
          </select>
          <label className="flex items-start gap-2 font-ui text-xs text-foreground">
            <input
              type="checkbox"
              checked={value.includeArticles}
              onChange={(e) => onChange({ ...value, includeArticles: e.target.checked })}
              className="mt-0.5 h-4 w-4 accent-[var(--brand-crimson)]"
            />
            <span>
              {L(
                "এই বিভাগের প্রতিটি খবরের পাতাতেও দেখাবে",
                "Also on every story in this category",
              )}
              <span className="block text-foreground-muted">
                {L(
                  "বন্ধ রাখলে শুধু বিভাগের তালিকার পাতায় দেখাবে",
                  "Off: only on the category's listing page",
                )}
              </span>
            </span>
          </label>
        </div>
      )}

      {mode === "LINK" && (
        <div className="flex flex-col gap-2 rounded-xl bg-surface p-3">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={L(
              "সাইটের যে পাতায় দেখাতে চান তার লিংক কপি করে এখানে দিন",
              "Paste the link of the page on this site",
            )}
            className={inputCls}
          />
          {resolving ? (
            <p className="flex items-center gap-1.5 font-ui text-xs text-foreground-muted">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {L("পাতাটি খোঁজা হচ্ছে…", "Looking the page up…")}
            </p>
          ) : linkError ? (
            <p className="font-ui text-xs text-brand-crimson">{linkError}</p>
          ) : value.slug || value.type === "HOME" ? (
            <p className="flex items-start gap-1.5 rounded-lg bg-green-50 px-2.5 py-2 font-ui text-xs text-green-800">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                <b>
                  {value.type === "ARTICLE"
                    ? L("খবর", "Story")
                    : value.type === "CATEGORY"
                      ? L("বিভাগ", "Category")
                      : L("হোমপেজ", "Homepage")}
                  :
                </b>{" "}
                {value.label}
              </span>
            </p>
          ) : (
            <p className="flex items-center gap-1.5 font-ui text-[11px] text-foreground-muted">
              <FileText className="h-3.5 w-3.5" />
              {L(
                "যেমন কোনো খবরে গিয়ে ঠিকানা-বার থেকে লিংক কপি করুন",
                "e.g. open a story and copy the address bar",
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** A target filled in enough to send. */
export function targetReady(t: AdTarget) {
  return t.type === "ALL" || t.type === "HOME" || !!t.slug;
}

// --- where on the page ---

export interface SlotInfo {
  placement: AdPlacement;
  pricePerDay?: number;
  size?: string;
}

export function placementLabel(p: AdPlacement, L: (bn: string, en: string) => string) {
  switch (p) {
    case "HEADER":
      return L("উপরে", "Top");
    case "LEFT":
      return L("বামে", "Left");
    case "SIDEBAR":
      return L("ডানে", "Right");
    case "IN_ARTICLE":
      return L("কনটেন্টের ভিতরে", "Inside the content");
    case "FOOTER":
      return L("নিচে", "Bottom");
    case "POPUP":
      return L("পপআপ", "Popup");
  }
}

function placementHint(p: AdPlacement, L: (bn: string, en: string) => string) {
  switch (p) {
    case "HEADER":
      return L("পাতার একদম উপরে, হেডারের আগে", "Very top, above the header");
    case "LEFT":
      return L("বাম পাশে খাড়া; ছোট পর্দায় কনটেন্টের উপরে", "Tall rail on the left; above the content on smaller screens");
    case "SIDEBAR":
      return L("ডান পাশের কলামে", "In the right-hand column");
    case "IN_ARTICLE":
      return L("খবরের লেখার মধ্যে / তালিকার ভিতরে", "Within the story / the list");
    case "FOOTER":
      return L("পাতার নিচে, ফুটারের উপরে", "At the bottom, above the footer");
    case "POPUP":
      return L("পাতা খোলার কিছুক্ষণ পর মাঝখানে", "In the middle, shortly after the page opens");
  }
}

/** A thumbnail of a page with the chosen spot lit up. */
export function PlacementDiagram({ placement, active }: { placement: AdPlacement; active?: boolean }) {
  const hi = active ? "#c8102e" : "#e0505f";
  const lo = "#d9dee5";
  const box = (x: number, y: number, w: number, h: number, on: boolean, key: string) => (
    <rect key={key} x={x} y={y} width={w} height={h} rx={1.5} fill={on ? hi : lo} />
  );
  return (
    <svg viewBox="0 0 64 48" className="h-12 w-16 shrink-0" aria-hidden>
      <rect x="0.5" y="0.5" width="63" height="47" rx="3" fill="#fff" stroke="#cfd5dd" />
      {box(4, 3, 56, 4, placement === "HEADER", "h")}
      {box(4, 9, 56, 3, false, "nav")}
      {box(4, 14, 8, 26, placement === "LEFT", "l")}
      {box(14, 14, 32, 26, false, "main")}
      {placement === "IN_ARTICLE" && box(17, 24, 26, 6, true, "in")}
      {box(48, 14, 12, 26, placement === "SIDEBAR", "r")}
      {box(4, 42, 56, 3, placement === "FOOTER", "f")}
      {placement === "POPUP" && (
        <>
          <rect x="0.5" y="0.5" width="63" height="47" rx="3" fill="rgba(0,0,0,0.25)" />
          <rect x="20" y="13" width="24" height="20" rx="2" fill={hi} />
        </>
      )}
    </svg>
  );
}

const PAGE_ORDER: AdPlacement[] = ["HEADER", "LEFT", "SIDEBAR", "IN_ARTICLE", "FOOTER", "POPUP"];

/** The six spots on a page, each with its picture and price. */
export function PlacementPicker({
  slots,
  value,
  onChange,
  currency = "৳",
}: {
  slots: SlotInfo[];
  value: AdPlacement;
  onChange: (p: AdPlacement) => void;
  currency?: string;
}) {
  const L = useBi();
  // In the order they sit on the page, top to bottom, then the popup.
  const ordered = [...slots].sort(
    (x, y) => PAGE_ORDER.indexOf(x.placement) - PAGE_ORDER.indexOf(y.placement),
  );
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {ordered.map((s) => {
        const on = s.placement === value;
        return (
          <button
            key={s.placement}
            type="button"
            onClick={() => onChange(s.placement)}
            className={`${pill} ${on ? "border-brand-crimson bg-brand-crimson/[0.05]" : "border-border hover:border-brand-crimson/40"}`}
          >
            <PlacementDiagram placement={s.placement} active={on} />
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="font-ui text-sm font-semibold text-heading">
                  {placementLabel(s.placement, L)}
                </span>
                {s.pricePerDay !== undefined && (
                  <span className="shrink-0 font-ui text-xs font-bold text-brand-crimson">
                    {currency}
                    {s.pricePerDay.toLocaleString("en-US")}
                    <span className="font-normal text-foreground-muted">{L("/দিন", "/day")}</span>
                  </span>
                )}
              </span>
              <span className="block font-ui text-[11px] leading-snug text-foreground-muted">
                {placementHint(s.placement, L)}
              </span>
              {s.size && (
                <span className="block font-ui text-[10px] text-foreground-muted/80">
                  {L("সাইজ", "Size")}: {s.size}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** "Sports — and its stories", for showing a booking's target in a list. */
export function targetText(
  ad: { targetType?: TargetType | null; targetLabel?: string | null; targetIncludesArticles?: boolean },
  L: (bn: string, en: string) => string,
) {
  switch (ad.targetType ?? "ALL") {
    case "ALL":
      return L("পুরো সাইট", "Whole site");
    case "HOME":
      return L("হোমপেজ", "Homepage");
    case "CATEGORY":
      return `${L("বিভাগ", "Category")}: ${ad.targetLabel ?? ""}${
        ad.targetIncludesArticles ? L(" (ও এর খবরগুলো)", " (and its stories)") : ""
      }`;
    case "ARTICLE":
      return `${L("খবর", "Story")}: ${ad.targetLabel ?? ""}`;
  }
}

export { useBi };

/**
 * The uploaded banner as the site will show it in the chosen spot, with its
 * real size beside the sizes the spot is made for — and a plain warning when
 * its shape is wrong for the spot, before anyone pays for a poster squeezed
 * into a strip.
 */
export function AdCreativePreview({ url, placement }: { url: string; placement: AdPlacement }) {
  const L = useBi();
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const frame = AD_FRAMES[placement];
  const video = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);

  useEffect(() => setSize(null), [url]);

  const style = { maxWidth: "100%", maxHeight: `${Math.min(frame.maxH, 300)}px` };
  const ratio = size ? size.w / size.h : 1;
  const warning = !size
    ? null
    : frame.landscape && ratio < 1.2
      ? L(
          "এই জায়গার জন্য ব্যানারটি বেশি লম্বা/চৌকো — সাইটে ছোট হয়ে মাঝখানে দেখাবে। ভালো দেখাতে আড়াআড়ি ব্যানার দিন।",
          "This banner is too tall for this spot — it will show small in the middle. Use a wide banner.",
        )
      : placement === "LEFT" && ratio > 0.8
        ? L(
            "বাম পাশের জায়গাটি খাড়া — ১৬০×৬০০ মাপের লম্বা ব্যানার দিন।",
            "The left spot is tall — use a 160×600 banner.",
          )
        : null;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface/60 p-3">
      <p className="font-ui text-[11px] font-semibold text-foreground-muted">
        {L("সাইটে যেভাবে দেখাবে", "How it will look on the site")} · {placementLabel(placement, L)}
      </p>
      <div className="flex justify-center rounded-lg bg-background p-3">
        {video ? (
          <video
            src={url}
            muted
            className="block h-auto w-auto object-contain"
            style={{ ...style, maxWidth: `min(${frame.maxW}px, 100%)` }}
            onLoadedMetadata={(e) =>
              setSize({ w: e.currentTarget.videoWidth, h: e.currentTarget.videoHeight })
            }
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt=""
            className="block h-auto w-auto object-contain"
            style={{ ...style, maxWidth: `min(${frame.maxW}px, 100%)` }}
            onLoad={(e) =>
              setSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })
            }
          />
        )}
      </div>
      <p className="font-ui text-[11px] text-foreground-muted">
        {size && (
          <>
            {L("আপনার ব্যানার", "Your banner")}: {size.w}×{size.h} ·{" "}
          </>
        )}
        {L("এই জায়গার মাপ", "Sizes for this spot")}: {frame.sizes}
      </p>
      {warning && (
        <p className="rounded-lg bg-amber-50 px-2.5 py-2 font-ui text-xs text-amber-800">{warning}</p>
      )}
    </div>
  );
}
