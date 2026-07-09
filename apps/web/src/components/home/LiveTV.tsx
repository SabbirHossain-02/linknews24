"use client";

import { useState } from "react";
import { Play, Volume2 } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

// Drop the live stream embed URL here (e.g. a YouTube live embed:
// "https://www.youtube.com/embed/XXXX?autoplay=1"). While empty, a
// TV-style placeholder screen is shown with a "starting soon" message.
const LIVE_STREAM_URL = "";

export function LiveTV() {
  const { t } = useLocale();
  const [playing, setPlaying] = useState(false);

  return (
    <section className="shrink-0 overflow-hidden rounded-xl border border-brand-navy/20 bg-brand-navy shadow-[0_1px_2px_rgba(20,24,31,0.04),0_8px_24px_rgba(20,24,31,0.10)]">
      {/* TV top bezel — channel + on-air state */}
      <div className="flex items-center justify-between bg-brand-navy-soft px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-crimson opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand-crimson" />
          </span>
          <span className="font-ui text-xs font-bold uppercase tracking-wider text-white">
            {t("liveTv")}
          </span>
        </div>
        <span className="font-ui text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">
          {t("onAir")}
        </span>
      </div>

      {/* 16:9 screen */}
      <div className="relative aspect-video bg-black">
        {playing && LIVE_STREAM_URL ? (
          <iframe
            src={LIVE_STREAM_URL}
            title={t("liveTv")}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <>
            {/* Screen backdrop + subtle scanlines */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#141821] via-[#0d1017] to-black" />
            <div
              className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, #fff 0, #fff 1px, transparent 1px, transparent 3px)",
              }}
            />

            {/* LIVE badge (top-left) */}
            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded bg-brand-crimson px-2 py-1 shadow-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              <span className="font-ui text-[10px] font-bold uppercase tracking-widest text-white">
                Live
              </span>
            </div>

            {/* Mute/volume glyph (top-right, decorative) */}
            <Volume2 className="absolute right-3 top-3 h-4 w-4 text-white/40" />

            {/* Play button */}
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={t("watchLive")}
              className="group absolute inset-0 grid place-items-center"
            >
              <span className="grid h-14 w-14 place-items-center rounded-full bg-white/10 ring-1 ring-white/30 backdrop-blur-sm transition group-hover:scale-105 group-hover:bg-white/20">
                <Play className="ml-0.5 h-6 w-6 fill-white text-white" />
              </span>
            </button>

            {/* Lower-third channel bar (TV style) */}
            <div className="absolute inset-x-0 bottom-0">
              <div className="h-[3px] bg-brand-crimson" />
              <div className="flex items-center justify-between bg-gradient-to-t from-black/90 to-transparent px-3 py-2.5">
                <span className="text-sm font-bold tracking-tight text-white">
                  Link News<span className="text-brand-crimson">24</span>
                </span>
                <span className="font-ui text-[10px] font-medium text-white/60">
                  {t("liveStreamSoon")}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
