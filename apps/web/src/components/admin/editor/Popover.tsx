"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * A dropdown panel that escapes the ribbon.
 *
 * The ribbon scrolls horizontally, so an absolutely-positioned panel inside it
 * gets clipped by that overflow — the font-size list opened *inside* the ribbon
 * and was cut off. Word's menus float above the window, so these render into a
 * portal on `document.body` with fixed coordinates measured from the trigger,
 * and flip up or shift sideways when they would run off screen.
 */
export function Popover({
  anchor,
  onClose,
  width,
  children,
}: {
  anchor: HTMLElement | null;
  onClose: () => void;
  /** Panel width in px; defaults to the trigger's own width. */
  width?: number;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  useLayoutEffect(() => {
    if (!anchor) return;

    const place = () => {
      const rect = anchor.getBoundingClientRect();
      const panelWidth = width ?? Math.max(rect.width, 120);
      const gap = 2;

      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const spaceAbove = rect.top - 8;
      const openUp = spaceBelow < 180 && spaceAbove > spaceBelow;

      const maxHeight = Math.min(360, openUp ? spaceAbove : spaceBelow);
      const height = panelRef.current?.offsetHeight ?? 0;

      let left = rect.left;
      // Keep the panel inside the viewport horizontally.
      if (left + panelWidth > window.innerWidth - 8)
        left = Math.max(8, window.innerWidth - panelWidth - 8);

      setPos({
        top: openUp
          ? Math.max(8, rect.top - gap - Math.min(height || maxHeight, maxHeight))
          : rect.bottom + gap,
        left,
        width: panelWidth,
        maxHeight,
      });
    };

    place();
    // Re-measure once the panel has rendered, so an upward flip is exact.
    const raf = requestAnimationFrame(place);

    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [anchor, width]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (typeof document === "undefined" || !anchor || !pos) return null;

  return createPortal(
    <>
      <div className="fixed inset-0 z-[70]" onMouseDown={onClose} />
      <div
        ref={panelRef}
        // Keep the editor selection while interacting with the menu.
        onMouseDown={(e) => e.preventDefault()}
        style={{
          top: pos.top,
          left: pos.left,
          width: pos.width,
          maxHeight: pos.maxHeight,
        }}
        className="fixed z-[71] overflow-y-auto rounded border border-[#d4d4d4] bg-white py-1 shadow-[0_4px_20px_rgba(0,0,0,0.22)]"
      >
        {children}
      </div>
    </>,
    document.body,
  );
}
