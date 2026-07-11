import geoip from "geoip-lite";

export interface UAInfo {
  device: string; // desktop | mobile | tablet
  browser: string;
  os: string;
}

// Lightweight user-agent classification — no external dependency needed.
export function parseUA(ua: string): UAInfo {
  const s = ua || "";
  const isTablet = /iPad|Tablet|PlayBook|Silk|Kindle|(Android(?!.*Mobile))/i.test(s);
  const isMobile =
    !isTablet &&
    /Mobi|iPhone|iPod|Android.*Mobile|Windows Phone|IEMobile|BlackBerry|Opera Mini/i.test(
      s,
    );
  const device = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";

  let browser = "Other";
  if (/Edg[A-Z]?\//i.test(s)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(s)) browser = "Opera";
  else if (/SamsungBrowser/i.test(s)) browser = "Samsung";
  else if (/Chrome\//i.test(s) && !/Chromium/i.test(s)) browser = "Chrome";
  else if (/Firefox\//i.test(s)) browser = "Firefox";
  else if (/Version\/.*Safari/i.test(s)) browser = "Safari";

  let os = "Other";
  if (/Windows/i.test(s)) os = "Windows";
  else if (/Android/i.test(s)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(s)) os = "iOS";
  else if (/Mac OS X|Macintosh/i.test(s)) os = "macOS";
  else if (/Linux/i.test(s)) os = "Linux";

  return { device, browser, os };
}

export interface GeoInfo {
  country: string | null; // ISO-2 code, e.g. "BD"
  city: string | null;
}

export function geoLookup(ip?: string | null): GeoInfo {
  if (!ip) return { country: null, city: null };
  const clean = ip.replace(/^::ffff:/, "");
  try {
    const g = geoip.lookup(clean);
    return { country: g?.country || null, city: g?.city || null };
  } catch {
    return { country: null, city: null };
  }
}

// Best-effort real client IP (works direct or behind a proxy).
export function clientIp(headers: Record<string, unknown>, socketIp?: string): string {
  const xff = headers["x-forwarded-for"];
  const fromXff =
    typeof xff === "string" ? xff.split(",")[0].trim() : Array.isArray(xff) ? xff[0] : "";
  return (fromXff || socketIp || "").replace(/^::ffff:/, "");
}
