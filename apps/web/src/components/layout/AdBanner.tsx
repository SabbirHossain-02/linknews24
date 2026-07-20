import { AdSlot } from "@/components/ads/AdSlot";

// CNN-style leaderboard strip pinned above the header on every public page.
// It is NOT sticky: it scrolls away and the nav (SiteHeader) stays behind.
// AdSlot renders nothing when no HEADER ad is live, so no empty bar shows.
export function AdBanner() {
  return (
    <AdSlot
      placement="HEADER"
      className="flex w-full justify-center bg-brand-navy py-2"
      imgClassName="max-h-[250px] w-auto max-w-full object-contain"
    />
  );
}
