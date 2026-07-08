"use client";

import { useEffect, useState } from "react";

const MIN_SCALE = 0.9;
const MAX_SCALE = 1.3;
const STEP = 0.1;
const STORAGE_KEY = "linknews24-font-scale";

function applyScale(scale: number) {
  document.documentElement.style.setProperty("--font-scale", String(scale));
}

export function FontSizeControl() {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const stored = Number(localStorage.getItem(STORAGE_KEY));
    if (stored) {
      setScale(stored);
      applyScale(stored);
    }
  }, []);

  const adjust = (delta: number) => {
    const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, +(scale + delta).toFixed(1)));
    setScale(next);
    applyScale(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  return (
    <div className="flex items-center gap-1.5" aria-label="ফন্ট সাইজ পরিবর্তন">
      <button
        onClick={() => adjust(-STEP)}
        disabled={scale <= MIN_SCALE}
        aria-label="ফন্ট ছোট করুন"
        className="flex h-5 w-5 items-center justify-center text-xs font-bold transition-colors hover:text-white disabled:opacity-30"
      >
        অ−
      </button>
      <button
        onClick={() => adjust(STEP)}
        disabled={scale >= MAX_SCALE}
        aria-label="ফন্ট বড় করুন"
        className="flex h-5 w-5 items-center justify-center text-sm font-bold transition-colors hover:text-white disabled:opacity-30"
      >
        অ+
      </button>
    </div>
  );
}
