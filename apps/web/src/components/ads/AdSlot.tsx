"use client";

import { useEffect, useRef, useState } from "react";
import { API_BASE } from "@/lib/admin-api";

interface Ad {
  id: string;
  name: string;
  imageUrl: string;
  linkUrl: string;
  placement: string;
}

// Fetches an active ad for a placement, renders the banner, and reports
// impressions (once) + clicks to the API. Renders nothing if no ad is live.
export function AdSlot({
  placement,
  className = "",
  imgClassName = "w-full object-cover",
}: {
  placement: "HEADER" | "SIDEBAR" | "IN_ARTICLE" | "FOOTER" | "POPUP";
  className?: string;
  imgClassName?: string;
}) {
  const [ad, setAd] = useState<Ad | null>(null);
  const counted = useRef(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/ads?placement=${placement}`)
      .then((r) => r.json())
      .then((d) => {
        const ads: Ad[] = d.ads ?? [];
        if (ads.length) setAd(ads[Math.floor(Math.random() * ads.length)]);
      })
      .catch(() => {});
  }, [placement]);

  useEffect(() => {
    if (ad && !counted.current) {
      counted.current = true;
      fetch(`${API_BASE}/api/ads/${ad.id}/impression`, {
        method: "POST",
        keepalive: true,
      }).catch(() => {});
    }
  }, [ad]);

  if (!ad) return null;

  const onClick = () => {
    fetch(`${API_BASE}/api/ads/${ad.id}/click`, {
      method: "POST",
      keepalive: true,
    }).catch(() => {});
  };

  const isVideo = /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(ad.imageUrl);

  return (
    <a
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
        বিজ্ঞাপন
      </span>
    </a>
  );
}
