import { AdSlot } from "@/components/ads/AdSlot";

// CNN-style leaderboard strip pinned above the header on every public page.
// It is NOT sticky: it scrolls away and the nav (SiteHeader) stays behind.
// AdSlot renders nothing when no HEADER ad is live, so no empty bar shows.
export function AdBanner() {
  return (
    <AdSlot
      placement="HEADER"
      className="bg-brand-navy px-3 py-2 text-white"
    />
  );
}
