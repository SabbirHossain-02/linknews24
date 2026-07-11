"use client";

interface Point {
  label: string;
  value: number;
}

// Lightweight responsive area+line chart — no chart library.
export function LineChart({
  data,
  height = 180,
  color = "#c8102e",
}: {
  data: Point[];
  height?: number;
  color?: string;
}) {
  const W = 720;
  const H = height;
  const padX = 8;
  const padY = 16;
  const max = Math.max(1, ...data.map((d) => d.value));
  const n = data.length;

  const x = (i: number) =>
    n <= 1 ? W / 2 : padX + (i * (W - padX * 2)) / (n - 1);
  const y = (v: number) => H - padY - (v / max) * (H - padY * 2);

  const linePts = data.map((d, i) => `${x(i)},${y(d.value)}`).join(" ");
  const areaPts = `${padX},${H - padY} ${linePts} ${W - padX},${H - padY}`;

  // Show ~6 x-axis labels evenly.
  const step = Math.max(1, Math.round(n / 6));

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${W} ${H + 22}`}
        width="100%"
        preserveAspectRatio="none"
        className="block"
        role="img"
      >
        <defs>
          <linearGradient id="lc-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* horizontal gridlines */}
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <line
            key={g}
            x1={padX}
            x2={W - padX}
            y1={H - padY - g * (H - padY * 2)}
            y2={H - padY - g * (H - padY * 2)}
            stroke="currentColor"
            className="text-border"
            strokeWidth="1"
            strokeDasharray="3 4"
          />
        ))}

        <polygon points={areaPts} fill="url(#lc-fill)" />
        <polyline
          points={linePts}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {data.map((d, i) =>
          d.value > 0 ? (
            <circle key={i} cx={x(i)} cy={y(d.value)} r="3" fill={color} />
          ) : null,
        )}

        {/* x labels */}
        {data.map((d, i) =>
          i % step === 0 ? (
            <text
              key={i}
              x={x(i)}
              y={H + 14}
              textAnchor="middle"
              className="fill-foreground-muted"
              style={{ fontSize: "11px" }}
            >
              {d.label}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
}
