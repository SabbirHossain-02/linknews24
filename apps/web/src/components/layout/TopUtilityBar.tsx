import Link from "next/link";
import { Search } from "lucide-react";
import { formatBengaliDate } from "@/lib/bengali-calendar";

const now = new Date();

const gregorianDate = now.toLocaleDateString("bn-BD", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const bengaliDate = formatBengaliDate(now);

export function TopUtilityBar() {
  return (
    <div className="border-b border-white/10 bg-brand-navy-soft">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-x-4 gap-y-1 px-6 py-1.5 font-ui text-xs text-white/60">
        <span>
          {gregorianDate}
          <span className="text-white/30"> · </span>
          {bengaliDate}
        </span>
        <div className="flex items-center gap-4">
          <Link href="/epaper" className="transition-colors hover:text-white">
            ই-পেপার
          </Link>
          <button className="transition-colors hover:text-white">
            লগইন
          </button>
          <button className="text-brand-crimson transition-colors hover:text-white">
            সাবস্ক্রাইব
          </button>
          <Link href="/search" aria-label="সার্চ">
            <Search className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
