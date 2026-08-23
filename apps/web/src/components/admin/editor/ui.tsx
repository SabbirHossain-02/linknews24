"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Shared ribbon primitives for the Word-style article editor.
 *
 * Every control uses `keepFocus` on mousedown so clicking the ribbon never
 * steals the selection out of the editor — without it commands would apply to
 * an empty selection.
 */
export const keepFocus = (e: React.MouseEvent) => e.preventDefault();

/** A ribbon group: a row of controls with a Word-style caption underneath. */
export function Group({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full shrink-0 flex-col items-center gap-1 border-r border-border px-2 last:border-r-0">
      <div className="flex flex-1 flex-wrap items-center justify-center gap-0.5">
        {children}
      </div>
      <span className="select-none font-ui text-[10px] leading-none text-foreground-muted">
        {label}
      </span>
    </div>
  );
}

/** Vertical stack inside a group — lets small buttons sit in two rows. */
export function Stack({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-0.5">{children}</div>;
}

/** Row of controls inside a group. */
export function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}

export function Btn({
  active,
  disabled,
  onClick,
  title,
  children,
  big,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  /** Large Word-style button with the icon above a caption. */
  big?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={keepFocus}
      onClick={onClick}
      className={
        big
          ? `flex h-[52px] w-16 flex-col items-center justify-center gap-1 rounded px-1 text-[10px] leading-tight transition-colors disabled:opacity-30 ${
              active
                ? "bg-brand-crimson text-white"
                : "text-foreground hover:bg-surface"
            }`
          : `flex h-7 w-7 items-center justify-center rounded transition-colors disabled:opacity-30 ${
              active
                ? "bg-brand-crimson text-white"
                : "text-foreground hover:bg-surface"
            }`
      }
    >
      {children}
    </button>
  );
}

/** Generic dropdown anchored under its trigger. */
export function Dropdown({
  label,
  title,
  width = "w-32",
  panelWidth,
  children,
  icon,
}: {
  label?: React.ReactNode;
  title?: string;
  width?: string;
  panelWidth?: string;
  icon?: React.ReactNode;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="relative">
      <button
        type="button"
        title={title}
        onMouseDown={keepFocus}
        onClick={() => setOpen((v) => !v)}
        className={`flex ${width} h-7 items-center justify-between gap-1 rounded border border-border bg-background px-2 font-ui text-xs text-foreground hover:bg-surface`}
      >
        <span className="flex min-w-0 items-center gap-1 truncate">
          {icon}
          {label}
        </span>
        <ChevronDown className="h-3 w-3 shrink-0" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={close} />
          <div
            onMouseDown={keepFocus}
            className={`absolute left-0 top-full z-40 mt-1 ${
              panelWidth ?? width
            } max-h-80 overflow-y-auto rounded-lg border border-border bg-background py-1 shadow-xl`}
          >
            {children(close)}
          </div>
        </>
      )}
    </div>
  );
}

/** A single row inside a Dropdown panel. */
export function MenuItem({
  onClick,
  active,
  children,
  style,
}: {
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      onMouseDown={keepFocus}
      onClick={onClick}
      style={style}
      className={`block w-full px-3 py-1.5 text-left font-ui text-xs hover:bg-surface ${
        active ? "bg-surface font-semibold text-brand-crimson" : "text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * A swatch grid used by the text-colour and highlight pickers. Includes an
 * "automatic" reset entry plus a native colour input for anything custom.
 */
const SWATCHES = [
  "#000000", "#404040", "#737373", "#a3a3a3", "#d4d4d4", "#ffffff",
  "#d81f26", "#ea580c", "#f59e0b", "#eab308", "#84cc16", "#22c55e",
  "#14b8a6", "#0ea5e9", "#2563eb", "#4f46e5", "#7c3aed", "#c026d3",
  "#fecaca", "#fed7aa", "#fef08a", "#bbf7d0", "#bae6fd", "#e9d5ff",
];

export function ColorGrid({
  onPick,
  onReset,
  resetLabel,
  current,
}: {
  onPick: (color: string) => void;
  onReset: () => void;
  resetLabel: string;
  current?: string;
}) {
  return (
    <div className="p-2">
      <button
        type="button"
        onMouseDown={keepFocus}
        onClick={onReset}
        className="mb-2 block w-full rounded border border-border px-2 py-1 font-ui text-[11px] text-foreground hover:bg-surface"
      >
        {resetLabel}
      </button>
      <div className="grid grid-cols-6 gap-1">
        {SWATCHES.map((c) => (
          <button
            key={c}
            type="button"
            title={c}
            onMouseDown={keepFocus}
            onClick={() => onPick(c)}
            style={{ background: c }}
            className={`h-5 w-5 rounded border ${
              current?.toLowerCase() === c
                ? "border-brand-crimson ring-1 ring-brand-crimson"
                : "border-border"
            }`}
          />
        ))}
      </div>
      <label
        onMouseDown={keepFocus}
        className="mt-2 flex cursor-pointer items-center justify-center rounded border border-border px-2 py-1 font-ui text-[11px] text-foreground hover:bg-surface"
      >
        অন্য রঙ…
        <input
          type="color"
          onChange={(e) => onPick(e.target.value)}
          className="sr-only"
        />
      </label>
    </div>
  );
}

/** Closes a popover when the user clicks outside of it. */
export function useClickOutside<T extends HTMLElement>(onOutside: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onOutside]);
  return ref;
}
