"use client";

interface Row {
  label: string;
  count: number;
}

// Horizontal bar list (like Vercel Analytics) — pure CSS.
export function BarList({ rows }: { rows: Row[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  if (rows.length === 0) {
    return <p className="py-8 text-center font-ui text-sm text-foreground-muted">—</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {rows.map((r, i) => (
        <li key={i} className="relative">
          <div
            className="absolute inset-y-0 left-0 rounded bg-brand-crimson/10"
            style={{ width: `${(r.count / max) * 100}%` }}
          />
          <div className="relative flex items-center justify-between px-2 py-1.5">
            <span className="truncate font-ui text-xs text-foreground">{r.label}</span>
            <span className="ml-2 shrink-0 font-ui text-xs font-semibold text-foreground-muted">
              {r.count}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
