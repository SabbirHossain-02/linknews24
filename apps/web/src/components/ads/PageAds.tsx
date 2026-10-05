"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { AdSlot, fetchAds, type Ad } from "./AdSlot";
import { getSocket } from "@/lib/socket";
import { useLocale } from "@/components/providers/LocaleProvider";

/**
 * The left-hand ad.
 *
 * The site has no left column, so on a screen wide enough to have empty
 * margins it stands in the left margin as a tall rail that stays put while the
 * page scrolls. On anything narrower there is no margin to stand in, and a
 * booked ad must still be seen — there it sits at the top of the page content
 * instead. Only one of the two is ever displayed, and an element that is not
 * displayed is never counted as seen.
 */
export function LeftAd() {
  return (
    <>
      <div className="pointer-events-none fixed left-3 top-[200px] z-30 hidden w-[160px] min-[1900px]:block">
        <AdSlot
          placement="LEFT"
          className="pointer-events-auto text-foreground-muted"
        />
      </div>
      <div className="mx-auto w-full max-w-[1600px] px-6 pt-4 min-[1900px]:hidden">
        <AdSlot
          placement="LEFT"
          className="text-foreground-muted"
          maxW={728}
          maxH={160}
        />
      </div>
    </>
  );
}

const SEEN_KEY = "ln24-popup-seen";

function seenIds(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(SEEN_KEY) ?? "[]");
  } catch {
    return [];
  }
}

/**
 * The popup ad: once per visit for each ad, a few seconds after the page
 * opens, and closed with one click (or Esc, or a click outside).
 */
export function PopupAd() {
  const { locale } = useLocale();
  const pathname = usePathname() ?? "/";
  const [ad, setAd] = useState<Ad | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const load = () =>
      fetchAds("POPUP", pathname)
        .then((ads) => {
          const fresh = ads.filter((a) => !seenIds().includes(a.id));
          if (cancelled || !fresh.length) return;
          const pick = fresh[Math.floor(Math.random() * fresh.length)];
          timer = setTimeout(() => {
            if (cancelled) return;
            setAd(pick);
            try {
              sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seenIds(), pick.id]));
            } catch {
              /* private mode: it may show again next page, which is fine */
            }
          }, 3000);
        })
        .catch(() => {});
    load();
    const socket = getSocket();
    socket.on("content:changed", load);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      socket.off("content:changed", load);
    };
  }, [pathname]);

  useEffect(() => {
    if (!ad) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAd(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ad]);

  if (!ad) return null;
  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/55 px-4"
      onClick={() => setAd(null)}
    >
      <div className="relative max-w-[min(600px,92vw)]" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => setAd(null)}
          aria-label={locale === "en" ? "Close" : "বন্ধ করুন"}
          className="absolute -right-3 -top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-heading shadow-lg hover:bg-surface"
        >
          <X className="h-4 w-4" />
        </button>
        <AdSlot
          placement="POPUP"
          preset={ad}
          className="rounded-xl bg-background p-2 text-foreground-muted shadow-2xl"
        />
      </div>
    </div>
  );
}
