"use client";

interface Slice {
  label: string;
  value: number;
}

const PALETTE = ["#0f2c4d", "#c8102e", "#2563eb", "#f59e0b", "#10b981", "#8b5cf6"];

// Donut chart with legend — no chart library.
export function DonutChart({ data }: { data: Slice[] }) {
  const items = data.filter((d) => d.value > 0);
  const total = items.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return (
      <p className="py-10 text-center font-ui text-sm text-foreground-muted">—</p>
    );
  }

  const R = 60;
  const C = 2 * Math.PI * R;
  let offset = 0;
  const arcs = items.map((d, i) => {
    const frac = d.value / total;
    const dash = frac * C;
    const seg = {
      color: PALETTE[i % PALETTE.length],
      dasharray: `${dash} ${C - dash}`,
      dashoffset: -offset,
      pct: Math.round(frac * 100),
      label: d.label,
      value: d.value,
    };
    offset += dash;
    return seg;
  });

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 160 160" width="132" height="132" className="shrink-0">
        <g transform="translate(80,80) rotate(-90)">
          <circle
            r={R}
            fill="none"
            stroke="currentColor"
            className="text-surface"
            strokeWidth="20"
          />
          {arcs.map((a, i) => (
            <circle
              key={i}
              r={R}
              fill="none"
              stroke={a.color}
              strokeWidth="20"
              strokeDasharray={a.dasharray}
              strokeDashoffset={a.dashoffset}
            />
          ))}
        </g>
        <text
          x="80"
          y="76"
          textAnchor="middle"
          className="fill-heading"
          style={{ fontSize: "22px", fontWeight: 700 }}
        >
          {total}
        </text>
        <text
          x="80"
          y="94"
          textAnchor="middle"
          className="fill-foreground-muted"
          style={{ fontSize: "10px" }}
        >
          total
        </text>
      </svg>

      <ul className="flex min-w-0 flex-1 flex-col gap-1.5">
        {arcs.map((a, i) => (
          <li key={i} className="flex items-center gap-2 font-ui text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: a.color }}
            />
            <span className="truncate text-foreground">{a.label}</span>
            <span className="ml-auto shrink-0 font-semibold text-foreground-muted">
              {a.value} · {a.pct}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
