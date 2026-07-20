"use client";

import { useEffect, useState } from "react";
import { TopUtilityBar } from "./TopUtilityBar";
import { BreakingNewsTicker } from "./BreakingNewsTicker";
import { MainNav } from "./MainNav";

// CNN-style header: the whole bar is sticky, but once the reader scrolls past
// the top ad strip the utility bar + breaking ticker collapse away, leaving a
// slim sticky nav. Threshold is small so the collapse feels immediate.
const COLLAPSE_AT = 60;

export function SiteHeader() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setCompact(window.scrollY > COLLAPSE_AT);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
          compact ? "max-h-0 opacity-0" : "max-h-40 opacity-100"
        }`}
        aria-hidden={compact}
      >
        <TopUtilityBar />
        <BreakingNewsTicker />
      </div>
      <MainNav compact={compact} />
    </header>
  );
}
