"use client";

import type { Editor } from "@tiptap/react";
import { Printer, Redo2, Search, Undo2 } from "lucide-react";
import { keepFocus } from "./ui";

/**
 * Word's Quick Access Toolbar — the always-visible strip above the tab row.
 * Holds the commands you reach for regardless of which ribbon tab is open.
 */
export function QuickAccessToolbar({
  editor,
  onOpenFind,
}: {
  editor: Editor;
  onOpenFind: () => void;
}) {
  const Item = ({
    title,
    disabled,
    onClick,
    children,
  }: {
    title: string;
    disabled?: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={keepFocus}
      onClick={onClick}
      className="flex h-6 w-6 items-center justify-center rounded text-foreground/80 transition-colors hover:bg-black/10 disabled:opacity-30"
    >
      {children}
    </button>
  );

  return (
    <div className="flex items-center gap-1 border-b border-border bg-surface px-2 py-1">
      <Item
        title="আন্ডু (Ctrl+Z)"
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 className="h-3.5 w-3.5" />
      </Item>
      <Item
        title="রিডু (Ctrl+Y)"
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 className="h-3.5 w-3.5" />
      </Item>

      <span className="mx-1 h-4 w-px bg-border" />

      <Item title="খুঁজুন ও বদলান (Ctrl+F)" onClick={onOpenFind}>
        <Search className="h-3.5 w-3.5" />
      </Item>
      <Item title="প্রিন্ট (Ctrl+P)" onClick={() => window.print()}>
        <Printer className="h-3.5 w-3.5" />
      </Item>
    </div>
  );
}
