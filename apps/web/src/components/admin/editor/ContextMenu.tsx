"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronRight } from "lucide-react";

/**
 * A menu anchored to a point rather than to an element — what a right click
 * needs. Flips up and shifts sideways so it never opens off screen.
 */
export function ContextMenu({
  x,
  y,
  onClose,
  width = 232,
  children,
}: {
  x: number;
  y: number;
  onClose: () => void;
  width?: number;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    const place = () => {
      const height = panelRef.current?.offsetHeight ?? 0;
      const left =
        x + width > window.innerWidth - 8
          ? Math.max(8, window.innerWidth - width - 8)
          : x;
      const top =
        height && y + height > window.innerHeight - 8
          ? Math.max(8, window.innerHeight - height - 8)
          : y;
      setPos({ top, left });
    };
    place();
    // Measure again once the panel is on screen, so the flip is exact.
    const raf = requestAnimationFrame(place);
    return () => cancelAnimationFrame(raf);
  }, [x, y, width]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onClose, true);
    window.addEventListener("resize", onClose);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onClose, true);
      window.removeEventListener("resize", onClose);
    };
  }, [onClose]);

  if (typeof document === "undefined" || !pos) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[80]"
        onMouseDown={onClose}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />
      <div
        ref={panelRef}
        // Never let the menu take the selection away from the editor.
        onMouseDown={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
        style={{ top: pos.top, left: pos.left, width }}
        className="fixed z-[81] max-h-[80vh] overflow-y-auto rounded border border-[#d4d4d4] bg-white py-1 shadow-[0_6px_28px_rgba(0,0,0,0.26)]"
      >
        {children}
      </div>
    </>,
    document.body,
  );
}

/** One command in the menu. */
export function CmdItem({
  label,
  shortcut,
  icon,
  disabled,
  danger,
  onClick,
}: {
  label: string;
  shortcut?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 px-3 py-[5px] text-left font-ui text-[11.5px] transition-colors disabled:opacity-35 ${
        danger
          ? "text-[#b91c1c] hover:bg-[#fee2e2] disabled:hover:bg-transparent"
          : "text-[#222] hover:bg-[#e1dfdd] disabled:hover:bg-transparent"
      }`}
    >
      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center text-[#555]">
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {shortcut && (
        <span className="shrink-0 font-ui text-[10px] text-[#888]">
          {shortcut}
        </span>
      )}
    </button>
  );
}

/** A nested menu, opened by hovering — Word's ▸ submenus. */
export function CmdSub({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        className={`flex w-full items-center gap-2.5 px-3 py-[5px] text-left font-ui text-[11.5px] text-[#222] transition-colors ${
          open ? "bg-[#e1dfdd]" : ""
        }`}
      >
        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center text-[#555]">
          {icon}
        </span>
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <ChevronRight className="h-3 w-3 shrink-0 text-[#888]" />
      </button>
      {open && (
        // Sits to the left when there is no room on the right.
        <div className="absolute left-full top-0 z-[82] -mt-1 w-[210px] rounded border border-[#d4d4d4] bg-white py-1 shadow-[0_6px_28px_rgba(0,0,0,0.26)] max-[520px]:left-auto max-[520px]:right-full">
          {children}
        </div>
      )}
    </div>
  );
}

export function CmdSep() {
  return <div className="my-1 border-t border-[#e6e6e6]" />;
}

export function CmdHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-0.5 pt-1.5 font-ui text-[9px] font-bold uppercase tracking-wide text-[#999]">
      {children}
    </p>
  );
}
