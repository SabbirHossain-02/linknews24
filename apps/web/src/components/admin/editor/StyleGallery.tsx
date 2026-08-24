"use client";

import type { Editor } from "@tiptap/react";
import { keepFocus } from "./ui";
import { useAdminText } from "@/lib/admin-strings";

interface StyleDef {
  /** Caption under the swatch, as Word shows it. */
  name: string;
  /** Preview text — Word uses "AaBbCcD" for most styles. */
  sample: string;
  preview: React.CSSProperties;
  apply: (editor: Editor) => void;
  isActive: (editor: Editor) => boolean;
}

/**
 * Word's Styles gallery: a strip of live previews rather than a dropdown.
 * Every entry maps to a real command — nothing here is decorative.
 */
const STYLES: StyleDef[] = [
  {
    name: "¶ সাধারণ",
    sample: "AaBbCcD",
    preview: { fontSize: 11 },
    apply: (e) => e.chain().focus().setParagraph().run(),
    isActive: (e) => e.isActive("paragraph") && !e.isActive("blockquote"),
  },
  {
    name: "¶ ফাঁকা ছাড়া",
    sample: "AaBbCcD",
    preview: { fontSize: 11 },
    apply: (e) =>
      e.chain().focus().setParagraph().setParagraphSpacing("0").run(),
    isActive: (e) => e.isActive("paragraph", { spacing: "0" }),
  },
  ...([1, 2, 3, 4, 5, 6] as const).map((level) => ({
    name: `¶ শিরোনাম ${level}`,
    sample: level <= 2 ? "AaBbCc" : "AaBbCcD",
    preview: {
      fontSize: Math.max(19 - level * 2, 10),
      fontWeight: level <= 3 ? 700 : 600,
      color: level <= 2 ? "#d81f26" : "#a8151b",
    } as React.CSSProperties,
    apply: (e: Editor) => e.chain().focus().toggleHeading({ level }).run(),
    isActive: (e: Editor) => e.isActive("heading", { level }),
  })),
  {
    name: "উদ্ধৃতি",
    sample: "AaBbCcD",
    preview: { fontSize: 11, fontStyle: "italic", color: "#555" },
    apply: (e) => e.chain().focus().toggleBlockquote().run(),
    isActive: (e) => e.isActive("blockquote"),
  },
  {
    name: "গাঢ়",
    sample: "AaBbCcD",
    preview: { fontSize: 11, fontWeight: 700 },
    apply: (e) => e.chain().focus().toggleBold().run(),
    isActive: (e) => e.isActive("bold"),
  },
  {
    name: "তির্যক",
    sample: "AaBbCcD",
    preview: { fontSize: 11, fontStyle: "italic" },
    apply: (e) => e.chain().focus().toggleItalic().run(),
    isActive: (e) => e.isActive("italic"),
  },
  {
    name: "কোড",
    sample: "AaBbCcD",
    preview: { fontSize: 10, fontFamily: "monospace" },
    apply: (e) => e.chain().focus().toggleCodeBlock().run(),
    isActive: (e) => e.isActive("codeBlock"),
  },
];

export function StyleGallery({ editor }: { editor: Editor }) {
  const ax = useAdminText();
  return (
    <div className="flex max-w-[420px] items-center gap-0.5 overflow-x-auto py-0.5">
      {STYLES.map((style) => {
        const active = style.isActive(editor);
        return (
          <button
            key={style.name}
            type="button"
            title={ax(style.name)}
            onMouseDown={keepFocus}
            onClick={() => style.apply(editor)}
            className={`flex h-[46px] w-[62px] shrink-0 flex-col items-center justify-between rounded-sm border bg-white px-1 py-1 transition-colors ${
              active
                ? "border-[#d81f26] bg-[#fbe3e4]"
                : "border-[#d4d4d4] hover:border-[#8a8886] hover:bg-[#f3f2f1]"
            }`}
          >
            <span
              style={style.preview}
              className="flex flex-1 items-center overflow-hidden leading-none"
            >
              {style.sample}
            </span>
            <span className="w-full truncate text-center font-ui text-[9px] leading-none text-[#444]">
              {ax(style.name)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
