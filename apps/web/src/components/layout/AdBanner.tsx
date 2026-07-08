export function AdBanner() {
  return (
    <div className="bg-surface">
      <div className="mx-auto flex h-24 max-w-6xl items-center justify-center border-b border-border sm:h-[250px]">
        <span className="font-ui text-xs uppercase tracking-widest text-foreground-muted/60">
          বিজ্ঞাপনের স্থান
        </span>
      </div>
      <div className="border-b border-border py-1 text-center font-ui text-[11px] text-foreground-muted/70">
        বিজ্ঞাপন
      </div>
    </div>
  );
}
