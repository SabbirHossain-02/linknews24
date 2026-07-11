// Public site origin, used for canonical URLs, OpenGraph, sitemap and robots.
// Set NEXT_PUBLIC_SITE_URL once a domain is attached; falls back to the VPS host.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://144.79.249.242:4110"
).replace(/\/$/, "");
