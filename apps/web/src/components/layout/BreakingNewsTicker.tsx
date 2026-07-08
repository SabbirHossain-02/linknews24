import { breakingNewsItems } from "@/lib/mock-data";

export function BreakingNewsTicker() {
  const items = breakingNewsItems;

  return (
    <div className="flex items-stretch bg-brand-crimson text-white">
      <span className="flex shrink-0 items-center bg-brand-crimson-dark px-4 py-2 font-ui text-xs font-bold uppercase tracking-wider">
        ব্রেকিং
      </span>
      <div className="group relative flex flex-1 items-center overflow-hidden">
        <div className="flex shrink-0 animate-ticker items-center gap-16 whitespace-nowrap py-2 pl-6 group-hover:[animation-play-state:paused]">
          {[...items, ...items].map((item, i) => (
            <span key={i} className="text-sm">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
