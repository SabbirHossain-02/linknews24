import { AdSlot } from "@/components/ads/AdSlot";

// Leaderboard ad above the header (homepage only, via ConditionalAdBanner).
// AdSlot renders nothing when no HEADER ad is live, so no empty bar shows.
export function AdBanner() {
  return (
    <AdSlot
      placement="HEADER"
      className="mx-auto flex max-h-[250px] w-full max-w-[1600px] justify-center bg-surface"
      imgClassName="max-h-[250px] w-auto object-contain"
    />
  );
}
