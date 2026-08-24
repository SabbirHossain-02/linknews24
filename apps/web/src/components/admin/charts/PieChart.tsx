"use client";

import { useState } from "react";

export interface Slice {
  label: string;
  count: number;
}

/**
 * Four hues, in this fixed order, plus a neutral for the folded tail.
 *
 * Not picked by eye — run through the colour-blindness validator all-pairs
 * (any slice can end up beside any other): worst pair ΔE 9.2 under deuteranopia
 * and 16.3 under normal vision, both clear of the floor. A fifth hue could not
 * be added without a pair dropping below it, which is why the tail folds into
 * "Other" instead of growing the palette.
 */
const HUES = ["#2a78d6", "#eb6834", "#1baf7a", "#4a3aa7"];
const OTHER = "#9aa0aa";

const MAX_SLICES = HUES.length;

export function PieChart({
  data,
  otherLabel,
  totalLabel,
}: {
  data: Slice[];
  /** Name for the folded tail once there are more categories than hues. */
  otherLabel: string;
  /** Word under the number in the middle, e.g. "মোট". */
  totalLabel: string;
}) {
  const [hover, setHover] = useState<number | null>(null);

  const present = data.filter((d) => d.count > 0).sort((a, b) => b.count - a.count);
  const total = present.reduce((s, d) => s + d.count, 0);

  if (total === 0) {
    return (
      <p className="py-10 text-center font-ui text-sm text-foreground-muted">—</p>
    );
  }

  // Everything past the palette becomes one "Other" wedge rather than a new
  // hue nobody could tell from the others.
  const head = present.slice(0, MAX_SLICES);
  const tail = present.slice(MAX_SLICES);
  const slices = tail.length
    ? [
        ...head,
        { label: otherLabel, count: tail.reduce((s, d) => s + d.count, 0) },
      ]
    : head;

  const R = 56;
  const STROKE = 26;
  const C = 2 * Math.PI * R;
  // A 2px ring of surface between wedges — the separator is the gap, never a
  // border drawn around each one.
  const GAP = slices.length > 1 ? 2 : 0;

  let offset = 0;
  const arcs = slices.map((s, i) => {
    const frac = s.count / total;
    const length = Math.max(frac * C - GAP, 0.5);
    const arc = {
      ...s,
      color: i < MAX_SLICES && slices[i].label !== otherLabel ? HUES[i] : OTHER,
      dasharray: `${length} ${C - length}`,
      dashoffset: -offset,
      pct: Math.round(frac * 100),
    };
    offset += frac * C;
    return arc;
  });

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
      <svg
        viewBox="0 0 150 150"
        width="140"
        height="140"
        className="shrink-0"
        role="img"
        aria-label={arcs
          .map((a) => `${a.label}: ${a.count} (${a.pct}%)`)
          .join(", ")}
      >
        <g transform="translate(75,75) rotate(-90)">
          {arcs.map((a, i) => (
            <circle
              key={a.label}
              r={R}
              fill="none"
              stroke={a.color}
              strokeWidth={hover === i ? STROKE + 6 : STROKE}
              strokeDasharray={a.dasharray}
              strokeDashoffset={a.dashoffset}
              opacity={hover === null || hover === i ? 1 : 0.35}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="cursor-default transition-all duration-150"
            />
          ))}
        </g>

        {/* The middle carries the total, or whichever wedge is under the pointer. */}
        <text
          x="75"
          y="72"
          textAnchor="middle"
          className="fill-heading"
          style={{ fontSize: "20px", fontWeight: 700 }}
        >
          {hover === null ? total : `${arcs[hover].pct}%`}
        </text>
        <text
          x="75"
          y="89"
          textAnchor="middle"
          className="fill-foreground-muted"
          style={{ fontSize: "9px" }}
        >
          {hover === null ? totalLabel : arcs[hover].label}
        </text>
      </svg>

      {/* Every wedge is named here as well, so identity is never colour alone. */}
      <ul className="flex min-w-[150px] flex-1 flex-col gap-1.5">
        {arcs.map((a, i) => (
          <li
            key={a.label}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            className={`flex items-center gap-2 rounded px-1 py-0.5 font-ui text-xs transition-colors ${
              hover === i ? "bg-surface" : ""
            }`}
          >
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ backgroundColor: a.color }}
            />
            <span className="truncate text-foreground">{a.label}</span>
            <span className="ml-auto flex shrink-0 items-baseline gap-1.5">
              <span className="tabular-nums text-foreground-muted/70">
                {a.pct}%
              </span>
              <span className="font-semibold tabular-nums text-foreground-muted">
                {a.count}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
