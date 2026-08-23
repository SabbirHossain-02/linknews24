"use client";

import { useState } from "react";
import { ChevronDown, CornerDownRight } from "lucide-react";

/**
 * Ribbon primitives styled after the Microsoft Word desktop ribbon.
 *
 * Word's chrome colours are used deliberately — the brief was "exactly like
 * Word" — so the editor reads as a familiar Word window embedded in the admin
 * page rather than as another crimson admin panel.
 */
export const WORD_BLUE = "#2b579a";

/** Controls must not steal the selection out of the editor. */
export const keepFocus = (e: React.MouseEvent) => e.preventDefault();

/**
 * A ribbon group: controls, a caption underneath, and optionally Word's
 * dialog launcher (the small ↘ in the bottom-right corner).
 */
export function Group({
  label,
  onLaunch,
  launchTitle,
  children,
}: {
  label: string;
  /** When given, renders Word's ↘ dialog launcher. */
  onLaunch?: () => void;
  launchTitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-full shrink-0 flex-col border-r border-[#d4d4d4] px-1.5 last:border-r-0">
      <div className="flex flex-1 items-center gap-0.5 pb-0.5 pt-1">
        {children}
      </div>
      <div className="flex h-[15px] items-center justify-center">
        <span className="select-none font-ui text-[10px] leading-none text-[#666]">
          {label}
        </span>
        {onLaunch && (
          <button
            type="button"
            title={launchTitle ?? label}
            onMouseDown={keepFocus}
            onClick={onLaunch}
            className="absolute bottom-0 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-sm text-[#666] hover:bg-[#e1dfdd] hover:text-[#111]"
          >
            <CornerDownRight className="h-2.5 w-2.5" />
          </button>
        )}
      </div>
    </div>
  );
}

/** Two stacked rows of controls inside a group. */
export function Stack({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-0.5">{children}</div>;
}

export function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}

const activeCls = "bg-[#cce4f7] ring-1 ring-inset ring-[#6dace4]";

/** Small square ribbon button — the default control in Word's ribbon. */
export function Btn({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={keepFocus}
      onClick={onClick}
      className={`flex h-[22px] w-[22px] items-center justify-center rounded-sm text-[#333] transition-colors hover:bg-[#e1dfdd] disabled:opacity-30 disabled:hover:bg-transparent ${
        active ? activeCls : ""
      }`}
    >
      {children}
    </button>
  );
}

/** Small button with a text label beside the icon (Word's Cut / Copy rows). */
export function LabelBtn({
  onClick,
  title,
  icon,
  label,
  active,
}: {
  onClick: () => void;
  title: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={keepFocus}
      onClick={onClick}
      className={`flex h-[22px] items-center gap-1.5 rounded-sm px-1 text-left font-ui text-[11px] text-[#333] transition-colors hover:bg-[#e1dfdd] ${
        active ? activeCls : ""
      }`}
    >
      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
        {icon}
      </span>
      {label}
    </button>
  );
}

/** Word's tall button: large icon above a caption, optional ▾ menu. */
export function BigBtn({
  onClick,
  title,
  icon,
  label,
  active,
  menu,
}: {
  onClick: () => void;
  title: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  /** When given, a ▾ half opens this menu instead of running onClick. */
  menu?: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        title={title}
        onMouseDown={keepFocus}
        onClick={onClick}
        className={`flex h-[46px] w-[46px] flex-col items-center justify-center gap-0.5 rounded-sm px-0.5 text-[#333] transition-colors hover:bg-[#e1dfdd] ${
          active ? activeCls : ""
        }`}
      >
        {icon}
        <span className="flex items-center gap-0.5 font-ui text-[10px] leading-none">
          {label}
          {menu && <ChevronDown className="h-2.5 w-2.5" />}
        </span>
      </button>
      {menu && (
        <>
          <button
            type="button"
            aria-label={`${label} মেনু`}
            onMouseDown={keepFocus}
            onClick={() => setOpen((v) => !v)}
            className="absolute inset-x-0 bottom-0 h-3.5 rounded-b-sm hover:bg-[#d0cece]/60"
          />
          {open && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
              <div
                onMouseDown={keepFocus}
                className="absolute left-0 top-full z-40 mt-0.5 w-48 rounded border border-[#d4d4d4] bg-white py-1 shadow-lg"
              >
                {menu(() => setOpen(false))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

/** Combo box / dropdown trigger, styled like Word's font and size pickers. */
export function Combo({
  label,
  title,
  width = "w-32",
  panelWidth,
  children,
}: {
  label: React.ReactNode;
  title?: string;
  width?: string;
  panelWidth?: string;
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
        className={`flex ${width} h-[22px] items-center justify-between gap-1 rounded-sm border border-[#d4d4d4] bg-white px-1.5 font-ui text-[11px] text-[#333] hover:border-[#8a8886]`}
      >
        <span className="min-w-0 truncate">{label}</span>
        <ChevronDown className="h-3 w-3 shrink-0 text-[#666]" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={close} />
          <div
            onMouseDown={keepFocus}
            className={`absolute left-0 top-full z-40 mt-0.5 ${
              panelWidth ?? width
            } max-h-72 overflow-y-auto rounded border border-[#d4d4d4] bg-white py-1 shadow-lg`}
          >
            {children(close)}
          </div>
        </>
      )}
    </div>
  );
}

/** Icon-only dropdown trigger (highlight colour, borders, line spacing…). */
export function IconCombo({
  icon,
  title,
  panelWidth = "w-52",
  children,
}: {
  icon: React.ReactNode;
  title: string;
  panelWidth?: string;
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
        className="flex h-[22px] items-center gap-0 rounded-sm px-0.5 text-[#333] hover:bg-[#e1dfdd]"
      >
        {icon}
        <ChevronDown className="h-2.5 w-2.5 text-[#666]" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={close} />
          <div
            onMouseDown={keepFocus}
            className={`absolute left-0 top-full z-40 mt-0.5 ${panelWidth} max-h-72 overflow-y-auto rounded border border-[#d4d4d4] bg-white py-1 shadow-lg`}
          >
            {children(close)}
          </div>
        </>
      )}
    </div>
  );
}

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
      className={`block w-full px-3 py-1 text-left font-ui text-[11px] text-[#333] hover:bg-[#e1dfdd] ${
        active ? "bg-[#cce4f7] font-semibold" : ""
      }`}
    >
      {children}
    </button>
  );
}

export function MenuHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3 pb-0.5 pt-1.5 font-ui text-[9px] font-bold uppercase tracking-wide text-[#888]">
      {children}
    </p>
  );
}

const SWATCHES = [
  "#000000", "#404040", "#737373", "#a3a3a3", "#d4d4d4", "#ffffff",
  "#c00000", "#ff0000", "#ffc000", "#ffff00", "#92d050", "#00b050",
  "#00b0f0", "#0070c0", "#002060", "#7030a0", "#d81f26", "#e91e63",
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
        className="mb-1.5 block w-full rounded-sm border border-[#d4d4d4] px-2 py-1 font-ui text-[11px] text-[#333] hover:bg-[#e1dfdd]"
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
            className={`h-5 w-5 rounded-sm border ${
              current?.toLowerCase() === c
                ? "border-[#2b579a] ring-1 ring-[#2b579a]"
                : "border-[#d4d4d4]"
            }`}
          />
        ))}
      </div>
      <label
        onMouseDown={keepFocus}
        className="mt-1.5 flex cursor-pointer items-center justify-center rounded-sm border border-[#d4d4d4] px-2 py-1 font-ui text-[11px] text-[#333] hover:bg-[#e1dfdd]"
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
