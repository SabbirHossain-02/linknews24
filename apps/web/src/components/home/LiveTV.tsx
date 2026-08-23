"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Maximize2, Play, Volume2, VolumeX, X } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";
import { API_BASE } from "@/lib/admin-api";
import { getSocket } from "@/lib/socket";
import { liveEmbedUrl, youtubeCommand } from "@/lib/stream";

export function LiveTV() {
  const { locale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const [streamUrl, setStreamUrl] = useState("");
  const [breaking, setBreaking] = useState<
    { text: string; textEn: string }[]
  >([]);
  const [muted, setMuted] = useState(true);
  const overlayRef = useRef<HTMLDivElement>(null);
  const cardFrame = useRef<HTMLIFrameElement>(null);

  // The player URL is built once per stream. Rebuilding it on unmute would
  // reload the iframe and start the video over.
  const embedUrl = streamUrl ? liveEmbedUrl(streamUrl) : null;

  const toggleSound = () => {
    youtubeCommand(cardFrame.current, muted ? "unMute" : "mute");
    setMuted((m) => !m);
  };

  // Live stream config comes from the admin (Live TV settings) — refetched
  // live when the admin changes it.
  useEffect(() => {
    const refetch = () =>
      fetch(`${API_BASE}/api/livetv`)
        .then((r) => r.json())
        .then((d) => {
          setStreamUrl(
            d.live?.active && d.live?.streamUrl ? d.live.streamUrl : "",
          );
        })
        .catch(() => {});

    // The lower-third ticker carries the newsroom's real breaking list.
    const refetchBreaking = () =>
      fetch(`${API_BASE}/api/breaking`)
        .then((r) => r.json())
        .then((d) => setBreaking(Array.isArray(d.items) ? d.items : []))
        .catch(() => {});

    refetch();
    refetchBreaking();
    const socket = getSocket();
    socket.on("content:changed", refetch);
    socket.on("content:changed", refetchBreaking);
    return () => {
      socket.off("content:changed", refetch);
      socket.off("content:changed", refetchBreaking);
    };
  }, []);

  const ticker = breaking.map((i) =>
    locale === "en" ? i.textEn || i.text : i.text,
  );

  const closeLive = () => {
    setOpen(false);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  };

  // Request native fullscreen once the overlay is mounted, and keep state in
  // sync with Esc / native fullscreen exit.
  useEffect(() => {
    if (!open) return;

    // Best-effort native fullscreen — falls back to the fixed overlay.
    overlayRef.current?.requestFullscreen?.().catch(() => {});

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onFsChange = () => {
      if (!document.fullscreenElement) setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFsChange);
    };
  }, [open]);

  return (
    <>
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

        {/* 16:9 screen. With a stream set it plays by itself — silent and on
            a loop, the way a TV in the corner of a room does. Without one it
            stays a poster you can click to open the full-screen view. */}
        {embedUrl ? (
          <div className="relative aspect-video w-full bg-black">
            <iframe
              ref={cardFrame}
              src={embedUrl}
              title={t("liveTv")}
              allow="autoplay; encrypted-media; picture-in-picture"
              className="absolute inset-0 h-full w-full"
            />
            {/* Sound and full screen sit above the player; the rest of the
                picture is left alone so the video keeps playing. */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end gap-1.5 bg-gradient-to-t from-black/70 to-transparent p-2">
              <button
                type="button"
                onClick={toggleSound}
                aria-label={muted ? t("unmute") : t("mute")}
                title={muted ? t("unmute") : t("mute")}
                className="pointer-events-auto grid h-8 w-8 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              >
                {muted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setOpen(true)}
                aria-label={t("watchLive")}
                title={t("watchLive")}
                className="pointer-events-auto grid h-8 w-8 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={t("watchLive")}
            className="group relative block aspect-video w-full bg-black"
          >
            <TvScreen t={t} variant="card" />
            <span className="absolute inset-0 grid place-items-center">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-white/10 ring-1 ring-white/30 backdrop-blur-sm transition group-hover:scale-105 group-hover:bg-white/20">
                <Play className="ml-0.5 h-6 w-6 fill-white text-white" />
              </span>
            </span>
          </button>
        )}
      </section>

      {/* Fullscreen live-news overlay — portalled to <body> so it escapes the
          sidebar's stacking context and covers the whole viewport. */}
      {open &&
        createPortal(
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[100] flex flex-col bg-black"
        >
          {/* Top broadcast bar */}
          <div className="flex items-center justify-between gap-3 bg-gradient-to-b from-black/90 to-transparent px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 rounded bg-brand-crimson px-2 py-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                <span className="font-ui text-[11px] font-bold uppercase tracking-widest text-white">
                  Live
                </span>
              </span>
              <span className="text-base font-bold tracking-tight text-white sm:text-lg">
                Link News<span className="text-brand-crimson">24</span>
              </span>
              <span className="hidden font-ui text-xs font-medium uppercase tracking-[0.2em] text-white/50 sm:inline">
                {t("liveBroadcast")}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <LiveClock locale={locale} />
              <button
                type="button"
                onClick={closeLive}
                aria-label={t("close")}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Screen */}
          <div className="relative flex min-h-0 flex-1 items-center justify-center">
            {embedUrl ? (
              <iframe
                src={`${embedUrl}&controls=1&mute=0`}
                title={t("liveTv")}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                className="h-full w-full"
              />
            ) : (
              <div className="relative aspect-video max-h-full w-full max-w-[min(100%,177vh)]">
                <TvScreen t={t} variant="full" />
              </div>
            )}
          </div>

          {/* Bottom breaking ticker — only when there is real breaking news */}
          {ticker.length > 0 && (
          <div className="flex items-stretch bg-black">
            <div className="flex shrink-0 items-center bg-brand-crimson px-4 font-ui text-xs font-bold uppercase tracking-wider text-white">
              {t("breaking")}
            </div>
            <div className="flex flex-1 items-center overflow-hidden py-2.5">
              <div className="flex animate-ticker whitespace-nowrap">
                {[...ticker, ...ticker].map((item, i) => (
                  <span
                    key={i}
                    className="mx-8 text-sm font-medium text-white/90"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
          )}
        </div>,
          document.body,
        )}
    </>
  );
}

function TvScreen({
  t,
  variant,
}: {
  t: (key: "liveStreamSoon") => string;
  variant: "card" | "full";
}) {
  return (
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

      {variant === "card" && (
        <>
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded bg-brand-crimson px-2 py-1 shadow-sm">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            <span className="font-ui text-[10px] font-bold uppercase tracking-widest text-white">
              Live
            </span>
          </div>
          <Volume2 className="absolute right-3 top-3 h-4 w-4 text-white/40" />
        </>
      )}

      {variant === "full" && (
        <div className="absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center gap-3">
            <span className="text-3xl font-bold tracking-tight text-white/25 sm:text-5xl">
              Link News<span className="text-brand-crimson/50">24</span>
            </span>
            <span className="font-ui text-sm text-white/40">
              {t("liveStreamSoon")}
            </span>
          </div>
        </div>
      )}

      {/* Lower-third channel bar (TV style) */}
      <div className="absolute inset-x-0 bottom-0">
        <div className="h-[3px] bg-brand-crimson" />
        <div className="flex items-center justify-between bg-gradient-to-t from-black/90 to-transparent px-3 py-2.5">
          <span className="text-sm font-bold tracking-tight text-white">
            Link News<span className="text-brand-crimson">24</span>
          </span>
          <span className="hidden font-ui text-[10px] font-medium text-white/60 sm:inline">
            {t("liveStreamSoon")}
          </span>
          {variant === "card" && (
            <Maximize2 className="h-3.5 w-3.5 text-white/50 sm:hidden" />
          )}
        </div>
      </div>
    </>
  );
}

function LiveClock({ locale }: { locale: "bn" | "en" }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString(locale === "bn" ? "bn-BD" : "en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [locale]);

  if (!time) return null;
  return (
    <span className="font-ui text-sm font-medium tabular-nums text-white/80">
      {time}
    </span>
  );
}
