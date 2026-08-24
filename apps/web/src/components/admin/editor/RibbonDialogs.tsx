"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { X } from "lucide-react";
import { FONTS, FONT_SIZES, LINE_HEIGHTS } from "./extensions";
import { useAdminText } from "@/lib/admin-strings";

/** Word-style dialog shell: title bar, body, and OK / Cancel footer. */
function DialogShell({
  title,
  onClose,
  onApply,
  children,
}: {
  title: string;
  onClose: () => void;
  onApply: () => void;
  children: React.ReactNode;
}) {
  const ax = useAdminText();
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md overflow-hidden rounded border border-[#d4d4d4] bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-[#14181f] px-3 py-1.5">
          <span className="font-ui text-xs font-semibold text-white">
            {title}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-5 w-5 items-center justify-center rounded-sm text-white/80 hover:bg-white/20 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex flex-col gap-3 p-4">{children}</div>

        <div className="flex justify-end gap-2 border-t border-[#e1dfdd] bg-[#f3f2f1] px-4 py-2.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm border border-[#d4d4d4] bg-white px-4 py-1 font-ui text-[11px] text-[#333] hover:bg-[#e1dfdd]"
          >
            {ax("বাতিল")}
          </button>
          <button
            type="button"
            onClick={() => {
              onApply();
              onClose();
            }}
            className="rounded-sm bg-[#14181f] px-4 py-1 font-ui text-[11px] font-semibold text-white hover:bg-[#2a3240]"
          >
            {ax("ঠিক আছে")}
          </button>
        </div>
      </div>
    </div>
  );
}

const fieldCls =
  "h-7 w-full rounded-sm border border-[#d4d4d4] bg-white px-2 font-ui text-[11px] text-[#333] focus:border-[#d81f26] focus:outline-none";
const labelCls = "font-ui text-[10px] font-semibold uppercase text-[#666]";

/** Word's Font dialog — everything applies to the current selection. */
export function FontDialog({
  editor,
  onClose,
}: {
  editor: Editor;
  onClose: () => void;
}) {
  const ax = useAdminText();
  const current = editor.getAttributes("textStyle");
  const [family, setFamily] = useState<string>(current.fontFamily ?? "");
  const [size, setSize] = useState<string>(
    current.fontSize ? String(parseInt(current.fontSize, 10)) : "",
  );
  const [color, setColor] = useState<string>(current.color ?? "#000000");
  const [bold, setBold] = useState(editor.isActive("bold"));
  const [italic, setItalic] = useState(editor.isActive("italic"));
  const [underline, setUnderline] = useState(editor.isActive("underline"));
  const [strike, setStrike] = useState(editor.isActive("strike"));
  const [sup, setSup] = useState(editor.isActive("superscript"));
  const [sub, setSub] = useState(editor.isActive("subscript"));

  const apply = () => {
    const chain = editor.chain().focus();

    if (family) chain.setFontFamily(family);
    else chain.unsetFontFamily();

    if (size) chain.setFontSize(`${size}px`);
    else chain.unsetFontSize();

    chain.setColor(color);

    // Marks are toggles — only fire when the dialog differs from the document.
    if (bold !== editor.isActive("bold")) chain.toggleBold();
    if (italic !== editor.isActive("italic")) chain.toggleItalic();
    if (underline !== editor.isActive("underline")) chain.toggleUnderline();
    if (strike !== editor.isActive("strike")) chain.toggleStrike();
    if (sup !== editor.isActive("superscript")) chain.toggleSuperscript();
    if (sub !== editor.isActive("subscript")) chain.toggleSubscript();

    chain.run();
  };

  const Check = ({
    label,
    checked,
    onChange,
  }: {
    label: string;
    checked: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <label className="flex cursor-pointer items-center gap-1.5 font-ui text-[11px] text-[#333]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-[#d81f26]"
      />
      {label}
    </label>
  );

  return (
    <DialogShell title={ax("ফন্ট")} onClose={onClose} onApply={apply}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className={labelCls}>{ax("ফন্ট")}</p>
          <select
            value={family}
            onChange={(e) => setFamily(e.target.value)}
            className={`${fieldCls} mt-1`}
          >
            <option value="">{ax("ডিফল্ট")}</option>
            {FONTS.map((f) => (
              <option key={f.label} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className={labelCls}>{ax("সাইজ")}</p>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className={`${fieldCls} mt-1`}
          >
            <option value="">{ax("ডিফল্ট")}</option>
            {FONT_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <p className={labelCls}>{ax("ফন্টের রঙ")}</p>
        <div className="mt-1 flex items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-7 w-12 cursor-pointer rounded-sm border border-[#d4d4d4]"
          />
          <span className="font-ui text-[11px] text-[#666]">{color}</span>
        </div>
      </div>

      <div>
        <p className={labelCls}>{ax("স্টাইল ও ইফেক্ট")}</p>
        <div className="mt-1.5 grid grid-cols-3 gap-y-1.5">
          <Check label="Bold" checked={bold} onChange={setBold} />
          <Check label="Italic" checked={italic} onChange={setItalic} />
          <Check label="Underline" checked={underline} onChange={setUnderline} />
          <Check label="Strikethrough" checked={strike} onChange={setStrike} />
          <Check label="Superscript" checked={sup} onChange={setSup} />
          <Check label="Subscript" checked={sub} onChange={setSub} />
        </div>
      </div>

      <div>
        <p className={labelCls}>{ax("প্রিভিউ")}</p>
        <div className="mt-1 flex h-14 items-center justify-center rounded-sm border border-[#d4d4d4] bg-[#f9f9f9]">
          <span
            style={{
              fontFamily: family || undefined,
              fontSize: size ? `${size}px` : "17px",
              color,
              fontWeight: bold ? 700 : 400,
              fontStyle: italic ? "italic" : "normal",
              textDecoration: [
                underline ? "underline" : "",
                strike ? "line-through" : "",
              ]
                .filter(Boolean)
                .join(" "),
            }}
          >
            {ax("আমার সোনার বাংলা — AaBbCcD")}
          </span>
        </div>
      </div>
    </DialogShell>
  );
}

/** Word's Paragraph dialog. */
export function ParagraphDialog({
  editor,
  onClose,
}: {
  editor: Editor;
  onClose: () => void;
}) {
  const ax = useAdminText();
  const blockName = editor.isActive("heading") ? "heading" : "paragraph";
  const attrs = editor.getAttributes(blockName);

  const [align, setAlign] = useState<string>(attrs.textAlign ?? "left");
  const [indent, setIndent] = useState<number>(attrs.indent ?? 0);
  const [spacing, setSpacing] = useState<string>(attrs.spacing ?? "");
  const [lineHeight, setLineHeight] = useState<string>(attrs.lineHeight ?? "");
  const [dir, setDir] = useState<string>(attrs.dir ?? "");

  const apply = () => {
    const chain = editor.chain().focus();

    chain.setTextAlign(align as "left" | "center" | "right" | "justify");

    // Indent has no absolute setter — step to the requested level.
    const delta = indent - (attrs.indent ?? 0);
    for (let i = 0; i < Math.abs(delta); i++) {
      if (delta > 0) chain.indent();
      else chain.outdent();
    }

    chain.setParagraphSpacing(spacing || null);

    if (lineHeight) chain.setLineHeight(lineHeight);
    else chain.unsetLineHeight();

    chain.setBlockDirection((dir || null) as "ltr" | "rtl" | null);
    chain.run();
  };

  return (
    <DialogShell title={ax("প্যারাগ্রাফ")} onClose={onClose} onApply={apply}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className={labelCls}>{ax("অ্যালাইনমেন্ট")}</p>
          <select
            value={align}
            onChange={(e) => setAlign(e.target.value)}
            className={`${fieldCls} mt-1`}
          >
            <option value="left">{ax("বাম")}</option>
            <option value="center">{ax("মাঝ")}</option>
            <option value="right">{ax("ডান")}</option>
            <option value="justify">{ax("জাস্টিফাই")}</option>
          </select>
        </div>
        <div>
          <p className={labelCls}>{ax("লেখার দিক")}</p>
          <select
            value={dir}
            onChange={(e) => setDir(e.target.value)}
            className={`${fieldCls} mt-1`}
          >
            <option value="">{ax("ডিফল্ট")}</option>
            <option value="ltr">{ax("বাম → ডান")}</option>
            <option value="rtl">{ax("ডান → বাম")}</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className={labelCls}>{ax("ইনডেন্ট (ধাপ)")}</p>
          <input
            type="number"
            min={0}
            max={8}
            value={indent}
            onChange={(e) => setIndent(Number(e.target.value))}
            className={`${fieldCls} mt-1`}
          />
        </div>
        <div>
          <p className={labelCls}>{ax("লাইন স্পেসিং")}</p>
          <select
            value={lineHeight}
            onChange={(e) => setLineHeight(e.target.value)}
            className={`${fieldCls} mt-1`}
          >
            <option value="">{ax("ডিফল্ট")}</option>
            {LINE_HEIGHTS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <p className={labelCls}>{ax("প্যারার পরে ফাঁকা")}</p>
        <select
          value={spacing}
          onChange={(e) => setSpacing(e.target.value)}
          className={`${fieldCls} mt-1`}
        >
          <option value="">{ax("ডিফল্ট")}</option>
          <option value="0">{ax("নেই")}</option>
          <option value="0.5em">0.5em</option>
          <option value="1em">1em</option>
          <option value="1.5em">1.5em</option>
          <option value="2em">2em</option>
        </select>
      </div>
    </DialogShell>
  );
}
