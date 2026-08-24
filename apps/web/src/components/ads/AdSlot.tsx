"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE } from "@/lib/admin-api";
import { getSocket } from "@/lib/socket";
import { useLocale } from "@/components/providers/LocaleProvider";

interface Ad {
  id: string;
  name: string;
  imageUrl: string;
  linkUrl: string;
  placement: string;
}

/** Half the banner on screen … */
const VISIBLE_RATIO = 0.5;
/** … held there this long, before it counts as seen. */
const DWELL_MS = 1000;
const VIDEO_DWELL_MS = 2000;

const isVideoUrl = (url: string) => /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);

/**
 * One advertising slot.
 *
 * An impression is reported only once the banner has really been on screen —
 * half of it, for a full second (two for video), which is the measure the ad
 * industry settled on. Reporting it the moment the banner was placed on the
 * page counted footers nobody ever scrolled down to, and handing an advertiser
 * that number would have been telling them what was sent, not what was seen.
 */
export function AdSlot({
  placement,
  className = "",
  imgClassName = "w-full object-cover",
}: {
  placement: "HEADER" | "SIDEBAR" | "IN_ARTICLE" | "FOOTER" | "POPUP";
  className?: string;
  imgClassName?: string;
}) {
  const { t } = useLocale();
  const [ad, setAd] = useState<Ad | null>(null);
  const holder = useRef<HTMLAnchorElement>(null);
  const counted = useRef(false);
  const clicking = useRef(false);

  // Which ad is live here — re-read when the admin changes anything, so a new
  // booking appears without anyone reloading the page.
  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetch(`${API_BASE}/api/ads?placement=${placement}`)
        .then((r) => r.json())
        .then((d) => {
          if (cancelled) return;
          const ads: Ad[] = d.ads ?? [];
          setAd(ads.length ? ads[Math.floor(Math.random() * ads.length)] : null);
        })
        .catch(() => {});

    load();
    const socket = getSocket();
    socket.on("content:changed", load);
    return () => {
      cancelled = true;
      socket.off("content:changed", load);
    };
  }, [placement]);

  const report = useCallback((id: string, kind: "impression" | "click") => {
    fetch(`${API_BASE}/api/ads/${id}/${kind}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: window.location.pathname }),
      // The click sends the reader away from the page; without this the
      // browser would cancel the request on the way out.
      keepalive: true,
    }).catch(() => {});
  }, []);

  // Watch the slot, and count the impression once it has been properly seen.
  useEffect(() => {
    const node = holder.current;
    if (!ad || !node) return;
    counted.current = false;

    const dwell = isVideoUrl(ad.imageUrl) ? VIDEO_DWELL_MS : DWELL_MS;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const stop = () => {
      if (timer) clearTimeout(timer);
      timer = null;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (counted.current) return;
        if (entry.isIntersecting && entry.intersectionRatio >= VISIBLE_RATIO) {
          // Start the clock; scrolling away before it finishes cancels it.
          if (!timer)
            timer = setTimeout(() => {
              counted.current = true;
              report(ad.id, "impression");
              observer.disconnect();
            }, dwell);
        } else {
          stop();
        }
      },
      { threshold: [0, VISIBLE_RATIO, 1] },
    );

    observer.observe(node);

    // A hidden tab is not being looked at either.
    const onVisibility = () => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ad, report]);

  if (!ad) return null;

  const onClick = () => {
    // Guards a double click; the server also ignores repeats within seconds.
    if (clicking.current) return;
    clicking.current = true;
    setTimeout(() => {
      clicking.current = false;
    }, 1500);
    report(ad.id, "click");
  };

  const isVideo = isVideoUrl(ad.imageUrl);

  return (
    <a
      ref={holder}
      href={ad.linkUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={onClick}
      className={`group relative block overflow-hidden ${className}`}
    >
      {isVideo ? (
        <video
          src={ad.imageUrl}
          className={imgClassName}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ad.imageUrl} alt={ad.name} className={imgClassName} />
      )}
      <span className="absolute right-1 top-1 rounded bg-black/45 px-1.5 py-0.5 font-ui text-[10px] text-white/90">
        {t("adLabel")}
      </span>
    </a>
  );
}
