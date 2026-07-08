import { trendingTags } from "@/lib/mock-data";

export function TrendingTagsBar() {
  return (
    <div className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto px-6 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="shrink-0 font-ui text-xs font-bold uppercase tracking-wide text-brand-crimson">
          আলোচিত
        </span>
        {trendingTags.map((tag) => (
          <a
            key={tag}
            href="#"
            className="shrink-0 font-ui text-sm text-foreground/70 transition-colors hover:text-brand-crimson"
          >
            {tag}
          </a>
        ))}
      </div>
    </div>
  );
}
