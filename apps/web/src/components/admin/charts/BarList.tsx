"use client";

interface Row {
  label: string;
  count: number;
}

/**
 * Ranked horizontal bars — the plain answer to "which of these is biggest".
 *
 * Used for devices and browsers as well as countries and referrers. A donut
 * cannot do that job here: with one browser it is a filled ring saying nothing,
 * and with two devices it is a two-slice pie, which is a table with extra steps.
 * Bar length is read accurately; arc angle is not.
 */
export function BarList({
  rows,
  showShare = false,
}: {
  rows: Row[];
  /** Adds each row's percentage of the total beside its count. */
  showShare?: boolean;
}) {
  if (rows.length === 0) {
    return <p className="py-8 text-center font-ui text-sm text-foreground-muted">—</p>;
  }

  const sorted = [...rows].sort((a, b) => b.count - a.count);
  const max = Math.max(1, ...sorted.map((r) => r.count));
  const total = sorted.reduce((s, r) => s + r.count, 0);

  return (
    <ul className="flex flex-col gap-2">
      {sorted.map((r, i) => (
        <li key={i} className="relative">
          <div
            className="absolute inset-y-0 left-0 rounded bg-brand-crimson/10"
            style={{ width: `${(r.count / max) * 100}%` }}
          />
          <div className="relative flex items-center justify-between px-2 py-1.5">
            <span className="truncate font-ui text-xs text-foreground">{r.label}</span>
            <span className="ml-2 flex shrink-0 items-baseline gap-1.5 font-ui text-xs">
              {showShare && total > 0 && (
                <span className="tabular-nums text-foreground-muted/70">
                  {Math.round((r.count / total) * 100)}%
                </span>
              )}
              <span className="font-semibold tabular-nums text-foreground-muted">
                {r.count}
              </span>
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
