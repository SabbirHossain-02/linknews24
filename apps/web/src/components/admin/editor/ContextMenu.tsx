"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ChevronRight } from "lucide-react";

/**
 * The box the menu has to stay inside — the editor page area, so a menu never
 * spills onto the form around it. Submenus read it from here too.
 */
const BoundsContext = createContext<HTMLElement | null>(null);

const PAD = 6;

function boundsRect(el: HTMLElement | null) {
  if (el) {
    const r = el.getBoundingClientRect();
    // A container taller than the window is still limited by the window.
    return {
      left: Math.max(r.left, 0),
      right: Math.min(r.right, window.innerWidth),
      top: Math.max(r.top, 0),
      bottom: Math.min(r.bottom, window.innerHeight),
    };
  }
  return {
    left: 0,
    right: window.innerWidth,
    top: 0,
    bottom: window.innerHeight,
  };
}

/** Places a panel of `width` at (x, y), kept inside `bounds`. */
function place(
  x: number,
  y: number,
  width: number,
  height: number,
  bounds: ReturnType<typeof boundsRect>,
) {
  const left = Math.max(
    bounds.left + PAD,
    Math.min(x, bounds.right - width - PAD),
  );

  const below = bounds.bottom - y - PAD;
  const above = y - bounds.top - PAD;
  // Open downwards unless there is clearly more room the other way.
  const openUp = height > below && above > below;

  const maxHeight = Math.max(120, openUp ? above : below);
  const top = openUp
    ? Math.max(bounds.top + PAD, y - Math.min(height || maxHeight, maxHeight))
    : y;

  return { top, left, maxHeight };
}

/**
 * A menu anchored to a point rather than to an element — what a right click
 * needs. It is confined to the editor page and scrolls when the list is taller
 * than the room available, so nothing is ever out of reach.
 */
export function ContextMenu({
  x,
  y,
  bounds,
  onClose,
  width = 244,
  children,
}: {
  x: number;
  y: number;
  /** Element the menu must stay within. Falls back to the window. */
  bounds?: HTMLElement | null;
  onClose: () => void;
  width?: number;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    maxHeight: number;
  } | null>(null);

  useLayoutEffect(() => {
    const measure = () =>
      setPos(
        place(
          x,
          y,
          width,
          panelRef.current?.scrollHeight ?? 0,
          boundsRect(bounds ?? null),
        ),
      );
    measure();
    // Measure again with the panel on screen, so an upward flip is exact.
    const raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
  }, [x, y, width, bounds]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onClose);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onClose);
    };
  }, [onClose]);

  if (typeof document === "undefined" || !pos) return null;

  return createPortal(
    <BoundsContext.Provider value={bounds ?? null}>
      <div
        className="fixed inset-0 z-[80]"
        onMouseDown={onClose}
        onWheel={onClose}
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
        style={{
          top: pos.top,
          left: pos.left,
          width,
          maxHeight: pos.maxHeight,
        }}
        className="fixed z-[81] overflow-y-auto overscroll-contain rounded border border-[#d4d4d4] bg-white py-1 shadow-[0_6px_28px_rgba(0,0,0,0.26)]"
      >
        {children}
      </div>
    </BoundsContext.Provider>,
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

const SUB_WIDTH = 216;

/**
 * A nested menu, opened by hovering — Word's ▸ submenus.
 *
 * The panel is portalled rather than nested, because the parent menu scrolls:
 * a child positioned inside it would be clipped by that scroll box instead of
 * opening beside it.
 */
export function CmdSub({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  const bounds = useContext(BoundsContext);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    maxHeight: number;
  } | null>(null);

  const open = () => {
    window.clearTimeout(closeTimer.current);
    const r = triggerRef.current?.getBoundingClientRect();
    if (!r) return;
    const box = boundsRect(bounds);
    // Prefer the right side; fall back to the left when there is no room.
    const x =
      r.right + SUB_WIDTH <= box.right - PAD ? r.right : r.left - SUB_WIDTH;
    setPos(place(x, r.top - 4, SUB_WIDTH, panelRef.current?.scrollHeight ?? 0, box));
  };

  // A short delay lets the pointer cross the gap between item and panel.
  const close = () => {
    closeTimer.current = window.setTimeout(() => setPos(null), 140);
  };

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onMouseEnter={open}
        onMouseLeave={close}
        onClick={open}
        className={`flex w-full items-center gap-2.5 px-3 py-[5px] text-left font-ui text-[11.5px] text-[#222] transition-colors ${
          pos ? "bg-[#e1dfdd]" : "hover:bg-[#e1dfdd]"
        }`}
      >
        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center text-[#555]">
          {icon}
        </span>
        <span className="min-w-0 flex-1 truncate">{label}</span>
        <ChevronRight className="h-3 w-3 shrink-0 text-[#888]" />
      </button>

      {pos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            onMouseDown={(e) => e.preventDefault()}
            onMouseEnter={() => window.clearTimeout(closeTimer.current)}
            onMouseLeave={close}
            style={{
              top: pos.top,
              left: pos.left,
              width: SUB_WIDTH,
              maxHeight: pos.maxHeight,
            }}
            className="fixed z-[82] overflow-y-auto overscroll-contain rounded border border-[#d4d4d4] bg-white py-1 shadow-[0_6px_28px_rgba(0,0,0,0.26)]"
          >
            {children}
          </div>,
          document.body,
        )}
    </>
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
