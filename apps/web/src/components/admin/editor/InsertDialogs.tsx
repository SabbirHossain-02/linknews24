"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import { Loader2, Upload, X } from "lucide-react";
import { uploadFile } from "@/lib/admin-api";
import type { FigureAlign } from "./figure";
import { useAdminText } from "@/lib/admin-strings";

export type InsertDialogKind =
  | "image"
  | "video"
  | "link"
  | "bookmark"
  | "equation"
  | "table";

/** Word-style dialog shell, in LinkNews24 colours. */
function Shell({
  title,
  onClose,
  onApply,
  applyLabel,
  applyDisabled,
  children,
  wide,
}: {
  title: string;
  onClose: () => void;
  onApply: () => void;
  applyLabel?: string;
  applyDisabled?: boolean;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const ax = useAdminText();
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 p-4">
      <div
        className={`w-full ${
          wide ? "max-w-lg" : "max-w-md"
        } overflow-hidden rounded border border-[#d4d4d4] bg-white shadow-2xl`}
      >
        <div className="flex items-center justify-between bg-[#14181f] px-3 py-1.5">
          <span className="font-ui text-xs font-semibold text-white">{title}</span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-5 w-5 items-center justify-center rounded-sm text-white/80 hover:bg-white/20 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto p-4">
          {children}
        </div>

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
            disabled={applyDisabled}
            onClick={() => {
              onApply();
              onClose();
            }}
            className="rounded-sm bg-[#d81f26] px-4 py-1 font-ui text-[11px] font-semibold text-white hover:bg-[#a8151b] disabled:opacity-40"
          >
            {applyLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

const field =
  "h-8 w-full rounded-sm border border-[#d4d4d4] bg-white px-2 font-ui text-[12px] text-[#333] focus:border-[#d81f26] focus:outline-none";
const label = "font-ui text-[10px] font-semibold uppercase text-[#666]";

/* ------------------------------------------------------------------ image */

const ALIGNS: { value: FigureAlign; label: string }[] = [
  { value: "center", label: "মাঝে" },
  { value: "left", label: "বামে" },
  { value: "right", label: "ডানে" },
  { value: "wrap-left", label: "বামে, পাশে লেখা" },
  { value: "wrap-right", label: "ডানে, পাশে লেখা" },
];

export function ImageDialog({
  editor,
  onClose,
}: {
  editor: Editor;
  onClose: () => void;
}) {
  const ax = useAdminText();
  const existing = editor.isActive("figure")
    ? editor.getAttributes("figure")
    : null;

  const [src, setSrc] = useState<string>(existing?.src ?? "");
  const [alt, setAlt] = useState<string>(existing?.alt ?? "");
  const [caption, setCaption] = useState<string>(existing?.caption ?? "");
  const [credit, setCredit] = useState<string>(existing?.credit ?? "");
  const [align, setAlign] = useState<FigureAlign>(existing?.align ?? "center");
  const [width, setWidth] = useState<number>(existing?.width ?? 100);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      setSrc(await uploadFile(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : ax("আপলোড ব্যর্থ"));
    } finally {
      setUploading(false);
    }
  };

  const apply = () => {
    if (!src) return;
    const attrs = { src, alt, caption, credit, align, width };
    if (existing) editor.chain().focus().updateFigure(attrs).run();
    else editor.chain().focus().insertFigure(attrs).run();
  };

  return (
    <Shell
      title={ax(existing ? ax("ছবির সেটিংস") : ax("ছবি যোগ করুন"))}
      onClose={onClose}
      onApply={apply}
      applyDisabled={!src || uploading}
      wide
    >
      <div>
        <p className={label}>{ax("ছবি")}</p>
        <div className="mt-1 flex gap-2">
          <input
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            placeholder={ax("ছবির URL")}
            className={field}
          />
          <label
            className={`flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-sm border border-[#d4d4d4] px-3 font-ui text-[11px] text-[#333] hover:bg-[#e1dfdd] ${
              uploading ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            {ax("আপলোড")}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) pick(file);
              }}
            />
          </label>
        </div>
        {error && (
          <p className="mt-1 font-ui text-[10px] text-[#a8151b]">{error}</p>
        )}
      </div>

      {src && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          className="max-h-40 w-full rounded-sm border border-[#d4d4d4] object-contain"
        />
      )}

      <div>
        <p className={label}>{ax("ক্যাপশন — ছবির নিচে ছাপা হবে")}</p>
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder={ax("যেমন: রাজধানীর মিরপুরে নতুন উড়ালসড়ক")}
          className={`${field} mt-1`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className={label}>{ax("ছবির কৃতিত্ব")}</p>
          <input
            value={credit}
            onChange={(e) => setCredit(e.target.value)}
            placeholder={ax("ছবি: LinkNews24")}
            className={`${field} mt-1`}
          />
        </div>
        <div>
          <p className={label}>{ax("Alt লেখা — SEO ও অন্ধ পাঠকের জন্য")}</p>
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder={ax("ছবিতে যা দেখা যাচ্ছে")}
            className={`${field} mt-1`}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className={label}>{ax("অবস্থান")}</p>
          <select
            value={align}
            onChange={(e) => setAlign(e.target.value as FigureAlign)}
            className={`${field} mt-1`}
          >
            {ALIGNS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <p className={label}>{ax("চওড়া")} — {width}%</p>
          <input
            type="range"
            min={25}
            max={100}
            step={5}
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            className="mt-3 w-full accent-[#d81f26]"
          />
        </div>
      </div>
    </Shell>
  );
}

/* ------------------------------------------------------------------ video */

export function VideoDialog({
  editor,
  onClose,
}: {
  editor: Editor;
  onClose: () => void;
}) {
  const ax = useAdminText();
  const [url, setUrl] = useState("");

  return (
    <Shell
      title={ax("YouTube ভিডিও যোগ করুন")}
      onClose={onClose}
      onApply={() =>
        editor.chain().focus().setYoutubeVideo({ src: url.trim() }).run()
      }
      applyDisabled={!url.trim()}
    >
      <div>
        <p className={label}>{ax("ভিডিওর লিংক")}</p>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className={`${field} mt-1`}
          autoFocus
        />
        <p className="mt-1.5 font-ui text-[10px] leading-snug text-[#666]">
          {ax(
            "YouTube-এর সাধারণ লিংক বা youtu.be দুটোই চলবে। ভিডিওটি খবরের ভেতরে বসে যাবে, পাঠক সেখানেই দেখতে পারবে।",
          )}
        </p>
      </div>
    </Shell>
  );
}

/* ------------------------------------------------------------------- link */

export function LinkDialog({
  editor,
  onClose,
}: {
  editor: Editor;
  onClose: () => void;
}) {
  const ax = useAdminText();
  const current = (editor.getAttributes("link").href as string) ?? "";
  const [href, setHref] = useState(current || "https://");
  const [newTab, setNewTab] = useState(true);

  const apply = () => {
    const url = href.trim();
    if (!url || url === "https://") {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url, target: newTab ? "_blank" : null })
      .run();
  };

  return (
    <Shell
      title={ax(current ? ax("লিংক সম্পাদনা") : ax("লিংক যোগ করুন"))}
      onClose={onClose}
      onApply={apply}
      applyLabel={ax(current ? ax("সংরক্ষণ") : ax("যোগ করুন"))}
    >
      <div>
        <p className={label}>{ax("ঠিকানা")}</p>
        <input
          value={href}
          onChange={(e) => setHref(e.target.value)}
          className={`${field} mt-1`}
          autoFocus
        />
      </div>
      <label className="flex cursor-pointer items-center gap-2 font-ui text-[11px] text-[#333]">
        <input
          type="checkbox"
          checked={newTab}
          onChange={(e) => setNewTab(e.target.checked)}
          className="accent-[#d81f26]"
        />
        {ax("নতুন ট্যাবে খুলবে")}
      </label>
      {current && (
        <button
          type="button"
          onClick={() => {
            editor.chain().focus().unsetLink().run();
            onClose();
          }}
          className="self-start rounded-sm border border-[#d4d4d4] px-3 py-1 font-ui text-[11px] text-[#a8151b] hover:bg-[#fbe3e4]"
        >
          {ax("লিংক মুছে ফেলুন")}
        </button>
      )}
    </Shell>
  );
}

/* --------------------------------------------------------------- bookmark */

export function BookmarkDialog({
  editor,
  onClose,
}: {
  editor: Editor;
  onClose: () => void;
}) {
  const ax = useAdminText();
  const [name, setName] = useState("");

  const apply = () => {
    const id = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9ঀ-৿]+/g, "-")
      .replace(/^-+|-+$/g, "");
    if (!id) return;
    // An anchor is just an id on the current heading or paragraph.
    const type = editor.isActive("heading") ? "heading" : "paragraph";
    editor.chain().focus().updateAttributes(type, { id }).run();
  };

  return (
    <Shell
      title={ax("বুকমার্ক (অ্যাংকর) বসান")}
      onClose={onClose}
      onApply={apply}
      applyDisabled={!name.trim()}
    >
      <div>
        <p className={label}>{ax("বুকমার্কের নাম")}</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={ax("যেমন: ঘটনার-বিবরণ")}
          className={`${field} mt-1`}
          autoFocus
        />
        <p className="mt-1.5 font-ui text-[10px] leading-snug text-[#666]">
          {ax(
            "এই অনুচ্ছেদে একটি নাম বসবে, যাতে খবরের ভেতরেই সরাসরি এখানে লিংক করা যায় — লম্বা প্রতিবেদনে কাজে লাগে।",
          )}
        </p>
      </div>
    </Shell>
  );
}

/* --------------------------------------------------------------- equation */

const EQUATION_SAMPLES = [
  { label: "ভগ্নাংশ", tex: "\\frac{a}{b}" },
  { label: "বর্গমূল", tex: "\\sqrt{x^2 + y^2}" },
  { label: "যোগফল", tex: "\\sum_{i=1}^{n} x_i" },
  { label: "শতকরা বৃদ্ধি", tex: "\\frac{n_2 - n_1}{n_1} \\times 100\\%" },
];

export function EquationDialog({
  editor,
  onClose,
}: {
  editor: Editor;
  onClose: () => void;
}) {
  const ax = useAdminText();
  const [tex, setTex] = useState("");

  return (
    <Shell
      title={ax("ইকুয়েশন যোগ করুন")}
      onClose={onClose}
      onApply={() =>
        editor.chain().focus().insertInlineMath({ latex: tex.trim() }).run()
      }
      applyDisabled={!tex.trim()}
    >
      <div>
        <p className={label}>LaTeX</p>
        <input
          value={tex}
          onChange={(e) => setTex(e.target.value)}
          placeholder="\\frac{a}{b}"
          className={`${field} mt-1 font-mono`}
          autoFocus
        />
      </div>
      <div>
        <p className={label}>{ax("নমুনা — চাপলে বসে যাবে")}</p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {EQUATION_SAMPLES.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => setTex(s.tex)}
              className="rounded-sm border border-[#d4d4d4] px-2 py-1 font-ui text-[11px] text-[#333] hover:bg-[#e1dfdd]"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </Shell>
  );
}

/* ------------------------------------------------------------------ table */

export function TableDialog({
  editor,
  onClose,
}: {
  editor: Editor;
  onClose: () => void;
}) {
  const ax = useAdminText();
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [header, setHeader] = useState(true);

  return (
    <Shell
      title={ax("টেবিল যোগ করুন")}
      onClose={onClose}
      onApply={() =>
        editor
          .chain()
          .focus()
          .insertTable({ rows, cols, withHeaderRow: header })
          .run()
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className={label}>{ax("সারি (rows)")}</p>
          <input
            type="number"
            min={1}
            max={50}
            value={rows}
            onChange={(e) => setRows(Math.max(1, Number(e.target.value)))}
            className={`${field} mt-1`}
          />
        </div>
        <div>
          <p className={label}>{ax("কলাম (columns)")}</p>
          <input
            type="number"
            min={1}
            max={20}
            value={cols}
            onChange={(e) => setCols(Math.max(1, Number(e.target.value)))}
            className={`${field} mt-1`}
          />
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-2 font-ui text-[11px] text-[#333]">
        <input
          type="checkbox"
          checked={header}
          onChange={(e) => setHeader(e.target.checked)}
          className="accent-[#d81f26]"
        />
        {ax("প্রথম সারিটি হেডার হবে")}
      </label>
    </Shell>
  );
}
