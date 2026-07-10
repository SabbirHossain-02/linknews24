"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${wide ? "max-w-3xl" : "max-w-md"} overflow-hidden rounded-2xl bg-background shadow-2xl`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h2 className="text-base font-bold text-heading">{title}</h2>
          <button
            onClick={onClose}
            className="text-foreground-muted hover:text-foreground"
            aria-label="বন্ধ"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function PromptModal({
  title,
  label,
  initial = "",
  placeholder,
  confirmLabel = "ঠিক আছে",
  onSubmit,
  onClose,
}: {
  title: string;
  label?: string;
  initial?: string;
  placeholder?: string;
  confirmLabel?: string;
  onSubmit: (value: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(initial);

  return (
    <Modal title={title} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(value.trim());
        }}
      >
        {label && (
          <label className="font-ui text-xs font-semibold text-foreground-muted">
            {label}
          </label>
        )}
        <input
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-brand-crimson focus:outline-none focus:ring-2 focus:ring-brand-crimson/15"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 font-ui text-sm text-foreground hover:bg-surface"
          >
            বাতিল
          </button>
          <button
            type="submit"
            className="rounded-lg bg-brand-crimson px-4 py-2 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark"
          >
            {confirmLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export function ConfirmModal({
  title,
  message,
  confirmLabel = "মুছুন",
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="font-ui text-sm text-foreground-muted">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-lg border border-border px-4 py-2 font-ui text-sm text-foreground hover:bg-surface"
        >
          বাতিল
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="rounded-lg bg-brand-crimson px-4 py-2 font-ui text-sm font-semibold text-white hover:bg-brand-crimson-dark"
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
