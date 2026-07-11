"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { API_BASE } from "@/lib/admin-api";

// Records a page view on every public route change. Self-guards against admin
// routes; the API further ignores /admin and bot-less tracking is fine here.
export function TrackView() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    const referrer =
      typeof document !== "undefined" &&
      document.referrer &&
      !document.referrer.includes(window.location.host)
        ? document.referrer
        : "";
    fetch(`${API_BASE}/api/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, referrer }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
