"use client";

import type { Editor } from "@tiptap/react";
import { Printer, Redo2, Save, Search, Undo2 } from "lucide-react";
import { keepFocus } from "./ui";
import { useAdminText } from "@/lib/admin-strings";

/**
 * Word's blue title bar with the Quick Access Toolbar on the left and the
 * document name in the middle.
 */
export function WordTitleBar({
  editor,
  onOpenFind,
  documentName,
  saveState,
  onSave,
}: {
  editor: Editor;
  onOpenFind: () => void;
  documentName: string;
  /** null = nothing to save yet; shown next to the document name. */
  saveState?: string | null;
  onSave?: () => void;
}) {
  const ax = useAdminText();
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
      className="flex h-6 w-6 items-center justify-center rounded-sm text-white/90 transition-colors hover:bg-white/20 disabled:opacity-35 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );

  return (
    <div className="flex h-8 items-center gap-0.5 bg-[#14181f] px-1.5">
      {onSave && (
        <Item title={ax("খসড়া সেভ করুন (Ctrl+S)")} onClick={onSave}>
          <Save className="h-3.5 w-3.5" />
        </Item>
      )}
      <Item
        title={ax("আন্ডু (Ctrl+Z)")}
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <Undo2 className="h-3.5 w-3.5" />
      </Item>
      <Item
        title={ax("রিডু (Ctrl+Y)")}
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <Redo2 className="h-3.5 w-3.5" />
      </Item>
      <Item title={ax("খুঁজুন ও বদলান (Ctrl+F)")} onClick={onOpenFind}>
        <Search className="h-3.5 w-3.5" />
      </Item>
      <Item title={ax("প্রিন্ট (Ctrl+P)")} onClick={() => window.print()}>
        <Printer className="h-3.5 w-3.5" />
      </Item>

      <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 font-ui text-[11px] text-white/95">
        {documentName}
        {saveState ? <span className="text-white/70"> — {saveState}</span> : null}
      </span>
    </div>
  );
}
