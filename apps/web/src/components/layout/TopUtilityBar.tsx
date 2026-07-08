import { Search } from "lucide-react";

const today = new Date().toLocaleDateString("bn-BD", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function TopUtilityBar() {
  return (
    <div className="border-b border-white/10 bg-brand-navy-soft">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-1.5 font-ui text-xs text-white/60">
        <span>{today}</span>
        <div className="flex items-center gap-4">
          <button className="transition-colors hover:text-white">
            লগইন
          </button>
          <button className="text-brand-crimson transition-colors hover:text-white">
            সাবস্ক্রাইব
          </button>
          <Search className="h-3.5 w-3.5" aria-label="সার্চ" />
        </div>
      </div>
    </div>
  );
}
