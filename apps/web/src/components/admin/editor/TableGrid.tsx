"use client";

import { useState } from "react";
import { keepFocus } from "./ui";
import { useAdminText } from "@/lib/admin-strings";

const MAX_ROWS = 8;
const MAX_COLS = 10;

/**
 * Word's table grid picker: hover to size the table, click to insert.
 * The caption under the grid reads "4 x 3 টেবিল" as you move, so you know
 * what you are about to get before clicking.
 */
export function TableGrid({
  onPick,
}: {
  onPick: (rows: number, cols: number) => void;
}) {
  const ax = useAdminText();
  const [hover, setHover] = useState<{ row: number; col: number } | null>(null);

  return (
    <div className="p-2" onMouseLeave={() => setHover(null)}>
      <div className="flex flex-col gap-[2px]">
        {Array.from({ length: MAX_ROWS }, (_, r) => (
          <div key={r} className="flex gap-[2px]">
            {Array.from({ length: MAX_COLS }, (_, c) => {
              const on = hover !== null && r <= hover.row && c <= hover.col;
              return (
                <button
                  key={c}
                  type="button"
                  aria-label={`${r + 1} x ${c + 1}`}
                  onMouseDown={keepFocus}
                  onMouseEnter={() => setHover({ row: r, col: c })}
                  onClick={() => onPick(r + 1, c + 1)}
                  className={`h-[14px] w-[14px] rounded-[1px] border ${
                    on
                      ? "border-[#d81f26] bg-[#fbe3e4]"
                      : "border-[#d4d4d4] bg-white"
                  }`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <p className="mt-2 text-center font-ui text-[11px] text-[#444]">
        {hover
          ? `${hover.row + 1} × ${hover.col + 1} ${ax("টেবিল")}`
          : ax("মাউস ঘুরিয়ে মাপ বাছুন")}
      </p>
    </div>
  );
}
