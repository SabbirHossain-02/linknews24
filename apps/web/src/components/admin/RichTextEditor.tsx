"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import {
  TextStyle,
  Color,
  FontFamily,
  FontSize,
} from "@tiptap/extension-text-style";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Code,
  Eraser,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Quote,
  Redo,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo,
} from "lucide-react";
import { uploadFile } from "@/lib/admin-api";
import { PromptModal } from "./Modal";

const FONT_SIZES = ["14px", "16px", "18px", "20px", "24px", "30px", "36px"];
const FONTS = [
  { label: "ডিফল্ট", value: "" },
  { label: "Siyam Rupali", value: "var(--font-siyam-rupali)" },
  { label: "Hind Siliguri", value: "var(--font-hind-siliguri)" },
  { label: "Serif", value: "serif" },
  { label: "Monospace", value: "monospace" },
];

// keep the editor selection when clicking toolbar controls
const keepFocus = (e: React.MouseEvent) => e.preventDefault();

function Btn({
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
      className={`flex h-8 w-8 items-center justify-center rounded transition-colors disabled:opacity-30 ${
        active ? "bg-brand-crimson text-white" : "text-foreground hover:bg-surface"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarSelect({
  label,
  options,
  onSelect,
  width = "w-24",
}: {
  label: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  width?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onMouseDown={keepFocus}
        onClick={() => setOpen((v) => !v)}
        className={`flex ${width} h-8 items-center justify-between gap-1 rounded border border-border bg-background px-2 font-ui text-xs text-foreground hover:bg-surface`}
      >
        {label}
        <ChevronDown className="h-3 w-3 shrink-0" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className={`absolute left-0 top-full z-20 mt-1 ${width} max-h-64 overflow-y-auto rounded-lg border border-border bg-background py-1 shadow-lg`}
          >
            {options.map((o) => (
              <button
                key={o.label}
                type="button"
                onMouseDown={keepFocus}
                onClick={() => {
                  onSelect(o.value);
                  setOpen(false);
                }}
                className="block w-full px-3 py-1.5 text-left font-ui text-xs text-foreground hover:bg-surface"
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showLink, setShowLink] = useState(false);

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch (err) {
      alert(err instanceof Error ? err.message : "আপলোড ব্যর্থ");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-border bg-background p-2">
      <ToolbarSelect
        label="ফন্ট"
        width="w-28"
        options={FONTS}
        onSelect={(v) =>
          v
            ? editor.chain().focus().setFontFamily(v).run()
            : editor.chain().focus().unsetFontFamily().run()
        }
      />
      <ToolbarSelect
        label="সাইজ"
        width="w-16"
        options={[
          { label: "রিসেট", value: "" },
          ...FONT_SIZES.map((s) => ({ label: s.replace("px", ""), value: s })),
        ]}
        onSelect={(v) =>
          v
            ? editor.chain().focus().setFontSize(v).run()
            : editor.chain().focus().unsetFontSize().run()
        }
      />

      <span className="mx-1 h-6 w-px bg-border" />

      <Btn title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="h-4 w-4" />
      </Btn>
      <Btn title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="h-4 w-4" />
      </Btn>
      <Btn title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon className="h-4 w-4" />
      </Btn>
      <Btn title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough className="h-4 w-4" />
      </Btn>

      <label
        title="টেক্সট কালার"
        onMouseDown={keepFocus}
        className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded text-foreground hover:bg-surface"
      >
        <span className="text-sm font-bold">A</span>
        <input
          type="color"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
      <Btn title="হাইলাইট" active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()}>
        <Highlighter className="h-4 w-4" />
      </Btn>

      <span className="mx-1 h-6 w-px bg-border" />

      <Btn title="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        <Heading1 className="h-4 w-4" />
      </Btn>
      <Btn title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        <Heading2 className="h-4 w-4" />
      </Btn>
      <Btn title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 className="h-4 w-4" />
      </Btn>

      <span className="mx-1 h-6 w-px bg-border" />

      <Btn title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="h-4 w-4" />
      </Btn>
      <Btn title="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered className="h-4 w-4" />
      </Btn>
      <Btn title="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="h-4 w-4" />
      </Btn>
      <Btn title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        <Code className="h-4 w-4" />
      </Btn>

      <span className="mx-1 h-6 w-px bg-border" />

      <Btn title="বাম" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
        <AlignLeft className="h-4 w-4" />
      </Btn>
      <Btn title="মাঝ" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
        <AlignCenter className="h-4 w-4" />
      </Btn>
      <Btn title="ডান" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
        <AlignRight className="h-4 w-4" />
      </Btn>
      <Btn title="Justify" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}>
        <AlignJustify className="h-4 w-4" />
      </Btn>

      <span className="mx-1 h-6 w-px bg-border" />

      <Btn title="লিংক" active={editor.isActive("link")} onClick={() => setShowLink(true)}>
        <LinkIcon className="h-4 w-4" />
      </Btn>
      <Btn title="ছবি আপলোড" disabled={uploading} onClick={() => fileRef.current?.click()}>
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
      </Btn>
      <input ref={fileRef} type="file" accept="image/*" onChange={onPickImage} className="hidden" />
      <Btn title="বিভাজক" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className="h-4 w-4" />
      </Btn>
      <Btn title="ফরম্যাট মুছুন" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
        <Eraser className="h-4 w-4" />
      </Btn>

      <span className="mx-1 h-6 w-px bg-border" />

      <Btn title="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}>
        <Undo className="h-4 w-4" />
      </Btn>
      <Btn title="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}>
        <Redo className="h-4 w-4" />
      </Btn>

      {showLink && (
        <PromptModal
          title="লিংক যুক্ত করুন"
          label="URL"
          initial={(editor.getAttributes("link").href as string) ?? "https://"}
          confirmLabel="যুক্ত করুন"
          onClose={() => setShowLink(false)}
          onSubmit={(url) => {
            setShowLink(false);
            if (!url) {
              editor.chain().focus().unsetLink().run();
            } else {
              editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
            }
          }}
        />
      )}
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "এখানে লিখুন…",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: false, underline: false }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({ multicolor: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: "ln-editor min-h-[280px] px-4 py-3 focus:outline-none" },
    },
  });

  if (!editor) {
    return <div className="min-h-[340px] rounded-lg border border-border bg-background" />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
