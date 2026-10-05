"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, ImagePlus, Plus, RotateCcw, Trash2 } from "lucide-react";
import { uploadFile } from "@/lib/admin-api";
import {
  SOCIAL_PLATFORMS,
  SocialBadge,
  platformFor,
  type SocialLink,
} from "@/components/icons/SocialPlatforms";
import { useAdminText } from "@/lib/admin-strings";

const inputCls =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-brand-crimson focus:outline-none focus:ring-2 focus:ring-brand-crimson/15";

/**
 * The footer's social links: as many as wanted, each a URL and a network.
 * Picking the network is all it takes for the footer to show that network's
 * own logo in its own colour.
 */
export function SocialLinksEditor({
  value,
  onChange,
  disabled,
}: {
  value: SocialLink[];
  onChange: (next: SocialLink[]) => void;
  disabled?: boolean;
}) {
  const ax = useAdminText();
  const used = new Set(value.map((v) => v.platform));
  const nextFree = SOCIAL_PLATFORMS.find((p) => !used.has(p.key))?.key ?? "website";

  const set = (i: number, patch: Partial<SocialLink>) =>
    onChange(value.map((v, j) => (j === i ? { ...v, ...patch } : v)));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2.5">
      {value.length === 0 && (
        <p className="rounded-lg border border-dashed border-border px-4 py-4 text-center font-ui text-xs text-foreground-muted">
          {ax("কোনো সোশ্যাল লিংক নেই — নিচের বাটনে যোগ করুন")}
        </p>
      )}
      {value.map((link, i) => {
        const p = platformFor(link.platform) ?? SOCIAL_PLATFORMS[0];
        const bad = link.url.trim() !== "" && !/^https?:\/\/\S+$/i.test(link.url.trim());
        return (
          <div key={i} className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
            <SocialBadge platform={p} size={40} />
            <div className="min-w-0 flex-1">
              <input
                value={link.url}
                disabled={disabled}
                onChange={(e) => set(i, { url: e.target.value })}
                placeholder={`https://… (${p.name} ${ax("লিংক")})`}
                className={`${inputCls} ${bad ? "border-brand-crimson" : ""}`}
              />
              {bad && (
                <p className="mt-1 font-ui text-[11px] text-brand-crimson">
                  {ax("লিংক https:// দিয়ে শুরু হতে হবে")}
                </p>
              )}
            </div>
            <select
              value={link.platform}
              disabled={disabled}
              onChange={(e) => set(i, { platform: e.target.value })}
              className={`${inputCls} sm:w-44`}
              aria-label={ax("সোশ্যাল মিডিয়া")}
            >
              {SOCIAL_PLATFORMS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.key === "website" ? ax("ওয়েবসাইট") : o.name}
                </option>
              ))}
            </select>
            <div className="flex shrink-0 items-center">
              <button
                type="button"
                disabled={disabled || i === 0}
                onClick={() => move(i, -1)}
                title={ax("উপরে")}
                className="rounded p-1.5 text-foreground-muted hover:bg-surface disabled:opacity-30"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={disabled || i === value.length - 1}
                onClick={() => move(i, 1)}
                title={ax("নিচে")}
                className="rounded p-1.5 text-foreground-muted hover:bg-surface disabled:opacity-30"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                title={ax("মুছে ফেলুন")}
                className="rounded p-1.5 text-foreground-muted hover:bg-surface hover:text-brand-crimson disabled:opacity-30"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange([...value, { platform: nextFree, url: "" }])}
        className="flex w-fit items-center gap-1.5 rounded-lg border border-dashed border-border px-3.5 py-2 font-ui text-sm font-semibold text-foreground hover:border-brand-crimson hover:text-brand-crimson disabled:opacity-40"
      >
        <Plus className="h-4 w-4" />
        {ax("সোশ্যাল লিংক যোগ করুন")}
      </button>
      {value.some((v) => v.url.trim()) && (
        <div className="mt-1 flex flex-wrap items-center gap-2 rounded-lg bg-surface px-3 py-2.5">
          <span className="font-ui text-[11px] font-semibold text-foreground-muted">
            {ax("ফুটারে যেমন দেখাবে")}:
          </span>
          {value
            .filter((v) => v.url.trim())
            .map((v, i) => {
              const p = platformFor(v.platform);
              return p ? <SocialBadge key={i} platform={p} size={30} /> : null;
            })}
        </div>
      )}
    </div>
  );
}

/** The masthead in the site's header and footer, replaceable by upload. */
export function LogoField({
  value,
  onChange,
  disabled,
}: {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}) {
  const ax = useAdminText();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) {
      setError(ax("PNG, JPG বা WEBP ছবি দিন"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      onChange(await uploadFile(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : ax("আপলোড ব্যর্থ"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-4">
        {/* Shown on the same white the header uses, at the header's height. */}
        <div className="flex h-20 min-w-[220px] items-center justify-center rounded-xl border border-border bg-white px-5">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-14 w-auto max-w-[240px] object-contain" />
          ) : (
            <Image src="/logo.png" alt="" width={169} height={54} className="h-14 w-auto" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            disabled={disabled || busy}
            onClick={() => input.current?.click()}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3.5 py-2 font-ui text-sm font-semibold text-foreground hover:bg-surface disabled:opacity-50"
          >
            <ImagePlus className="h-4 w-4" />
            {busy ? ax("আপলোড হচ্ছে…") : ax("নতুন লোগো আপলোড")}
          </button>
          {value && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange("")}
              className="flex items-center gap-1.5 font-ui text-xs font-semibold text-foreground-muted hover:text-brand-crimson"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {ax("আগের লোগোতে ফিরুন")}
            </button>
          )}
        </div>
        <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={pick} />
      </div>
      <p className="mt-2 font-ui text-xs text-foreground-muted">
        {ax("চওড়া (আড়াআড়ি) লোগো ভালো দেখায়, স্বচ্ছ ব্যাকগ্রাউন্ডের PNG হলে সবচেয়ে ভালো। সংরক্ষণ করলে হেডার ও ফুটারে সাথে সাথে বদলাবে।")}
      </p>
      {error && <p className="mt-1 font-ui text-xs text-brand-crimson">{error}</p>}
    </div>
  );
}
