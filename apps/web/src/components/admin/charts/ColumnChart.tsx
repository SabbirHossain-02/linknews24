"use client";

import { useState } from "react";

export interface Column {
  label: string;
  value: number;
}

/** Round a max up to something an axis tick can say out loud. */
function niceMax(max: number): number {
  if (max <= 5) return Math.max(1, max);
  const pow = 10 ** Math.floor(Math.log10(max));
  for (const step of [1, 2, 2.5, 5, 10]) {
    const candidate = step * pow;
    if (candidate >= max) return candidate;
  }
  return 10 * pow;
}

/**
 * A column chart for counting things per day.
 *
 * Daily impressions and clicks are discrete counts, one per day, so columns are
 * the honest form — an area chart drew a smooth slope between two days as if
 * something had been happening in between, and with mostly-empty days it was a
 * flat line with one diagonal spike.
 *
 * Deliberately one series. Impressions outnumber clicks by orders of magnitude,
 * and putting both on one scale would flatten clicks to nothing — two charts,
 * each with its own scale, rather than the second y-axis that would misread.
 */
export function ColumnChart({
  data,
  color,
  height = 150,
  valueLabel,
}: {
  data: Column[];
  /** The series colour. Text never wears it — only the columns do. */
  color: string;
  height?: number;
  /** Screen-reader/tooltip wording for what a value is, e.g. "impressions". */
  valueLabel: string;
}) {
  const [hover, setHover] = useState<number | null>(null);

  const rawMax = Math.max(0, ...data.map((d) => d.value));
  const max = niceMax(rawMax);
  const ticks = [max, max / 2, 0];

  // The biggest column gets the only direct label; the axis and the tooltip
  // carry the rest. A number over every column goes unread.
  const peak = rawMax > 0 ? data.findIndex((d) => d.value === rawMax) : -1;

  // With a month on screen there is no room for 30 dates — show about six.
  const every = Math.max(1, Math.ceil(data.length / 6));

  return (
    <div className="select-none">
      <div className="flex gap-2">
        {/* y axis */}
        <div
          className="flex w-8 shrink-0 flex-col justify-between text-right font-ui text-[10px] tabular-nums text-foreground-muted/70"
          style={{ height }}
        >
          {ticks.map((v) => (
            <span key={v} className="-translate-y-1/2 first:translate-y-0 last:-translate-y-full">
              {Math.round(v)}
            </span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1" style={{ height }}>
          {/* hairline grid, one step off the surface */}
          {ticks.map((v) => (
            <span
              key={v}
              className="absolute inset-x-0 border-t border-border"
              style={{ top: `${(1 - v / max) * 100}%` }}
            />
          ))}

          {/* columns — the whole band is the hit target, not just the paint */}
          <div className="absolute inset-0 flex items-end gap-[2px]">
            {data.map((d, i) => (
              <div
                key={d.label + i}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                role="img"
                aria-label={`${d.label}: ${d.value} ${valueLabel}`}
                className="group relative flex h-full flex-1 cursor-default items-end justify-center outline-none"
              >
                <span
                  aria-hidden
                  style={{
                    // A day with nothing still shows a sliver, so the reader can
                    // see the day exists and aim at it.
                    height: `${Math.max((d.value / max) * 100, d.value > 0 ? 2 : 1)}%`,
                    background: color,
                    opacity: hover === null || hover === i ? 1 : 0.45,
                  }}
                  className="w-full max-w-[24px] rounded-t-[4px] transition-opacity duration-150"
                />

                {i === peak && (
                  <span className="pointer-events-none absolute -top-4 font-ui text-[10px] font-semibold tabular-nums text-heading">
                    {d.value}
                  </span>
                )}

                {hover === i && (
                  <span className="pointer-events-none absolute bottom-full z-10 mb-5 whitespace-nowrap rounded-md bg-brand-navy px-2 py-1 text-white shadow-lg">
                    <span className="font-ui text-xs font-bold tabular-nums">
                      {d.value}
                    </span>
                    <span className="ml-1.5 font-ui text-[10px] text-white/70">
                      {d.label}
                    </span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* x axis, thinned out so the dates never collide */}
      <div className="mt-1.5 flex gap-[2px] pl-10">
        {data.map((d, i) => (
          <span
            key={d.label + i}
            className="flex-1 text-center font-ui text-[10px] text-foreground-muted/70"
          >
            {i % every === 0 || i === data.length - 1 ? d.label : " "}
          </span>
        ))}
      </div>
    </div>
  );
}
