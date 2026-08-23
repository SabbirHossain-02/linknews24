"use client";

import { useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Baseline,
  Bold,
  Brush,
  CaseSensitive,
  ChevronsLeftRight,
  ClipboardPaste,
  Copy,
  Eraser,
  Highlighter,
  IndentDecrease,
  IndentIncrease,
  Italic,
  List,
  ListChecks,
  ListOrdered,
  Scissors,
  Search,
  Strikethrough,
  Subscript as SubIcon,
  Superscript as SupIcon,
  TextQuote,
  Underline as UnderlineIcon,
  UnfoldVertical,
} from "lucide-react";
import { Btn, ColorGrid, Dropdown, Group, MenuItem, Row, Stack, keepFocus } from "./ui";
import { FONTS, FONT_SIZES, LINE_HEIGHTS } from "./extensions";
import { useFormatPainter } from "./use-format-painter";

/**
 * Rewrites the selected text through `fn` one text node at a time, so the
 * marks (bold, links, colour) sitting on each run survive the change.
 */
function transformSelection(editor: Editor, fn: (text: string) => string) {
  const { from, to } = editor.state.selection;
  if (from === to) return;

  const edits: { from: number; to: number; text: string }[] = [];
  editor.state.doc.nodesBetween(from, to, (node, pos) => {
    if (!node.isText || !node.text) return;
    const start = Math.max(pos, from);
    const end = Math.min(pos + node.text.length, to);
    if (start >= end) return;
    const slice = node.text.slice(start - pos, end - pos);
    const next = fn(slice);
    if (next !== slice) edits.push({ from: start, to: end, text: next });
  });
  if (!edits.length) return;

  const tr = editor.state.tr;
  // Back to front so earlier offsets stay valid.
  for (let i = edits.length - 1; i >= 0; i--) {
    const edit = edits[i];
    tr.insertText(edit.text, edit.from, edit.to);
  }
  editor.view.dispatch(tr);
  editor.commands.focus();
}

const CASE_MODES: { label: string; fn: (s: string) => string }[] = [
  {
    label: "Sentence case",
    fn: (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase(),
  },
  { label: "lowercase", fn: (s) => s.toLowerCase() },
  { label: "UPPERCASE", fn: (s) => s.toUpperCase() },
  {
    label: "Capitalize Each Word",
    fn: (s) => s.replace(/\b\w/g, (c) => c.toUpperCase()),
  },
  {
    label: "tOGGLE cASE",
    fn: (s) =>
      s.replace(/./g, (c) =>
        c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase(),
      ),
  },
];

const STYLES: { label: string; apply: (e: Editor) => void; css: React.CSSProperties }[] = [
  {
    label: "সাধারণ (Normal)",
    apply: (e) => e.chain().focus().setParagraph().run(),
    css: { fontSize: "13px" },
  },
  ...[1, 2, 3, 4, 5, 6].map((level) => ({
    label: `শিরোনাম ${level} (Heading ${level})`,
    apply: (e: Editor) =>
      e.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run(),
    css: {
      fontSize: `${20 - level * 1.5}px`,
      fontWeight: level <= 3 ? 700 : 600,
    } as React.CSSProperties,
  })),
  {
    label: "উদ্ধৃতি (Quote)",
    apply: (e) => e.chain().focus().toggleBlockquote().run(),
    css: { fontStyle: "italic", fontSize: "13px" },
  },
  {
    label: "কোড ব্লক (Code)",
    apply: (e) => e.chain().focus().toggleCodeBlock().run(),
    css: { fontFamily: "monospace", fontSize: "12px" },
  },
];

export function HomeTab({
  editor,
  onOpenFind,
}: {
  editor: Editor;
  onOpenFind: () => void;
}) {
  const { armed, copyFormat, paint } = useFormatPainter(editor);
  const [clipboardNote, setClipboardNote] = useState<string | null>(null);
  const painterRef = useRef(paint);
  painterRef.current = paint;

  // The painter fires on the next selection the user makes.
  const runPainter = () => {
    if (armed) painterRef.current();
  };

  const selectedHTML = () => {
    const { from, to } = editor.state.selection;
    const slice = editor.state.doc.slice(from, to);
    const div = document.createElement("div");
    div.appendChild(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (editor.view as any).someProp("clipboardSerializer")?.serializeFragment(
        slice.content,
      ) ?? document.createTextNode(editor.state.doc.textBetween(from, to, "\n")),
    );
    return div.innerHTML;
  };

  const doCopy = async (cut: boolean) => {
    const { from, to } = editor.state.selection;
    if (from === to) {
      setClipboardNote("আগে লেখা সিলেক্ট করুন");
      return;
    }
    const text = editor.state.doc.textBetween(from, to, "\n");
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([selectedHTML()], { type: "text/html" }),
          "text/plain": new Blob([text], { type: "text/plain" }),
        }),
      ]);
      if (cut) editor.chain().focus().deleteSelection().run();
      setClipboardNote(cut ? "কাট হয়েছে" : "কপি হয়েছে");
    } catch {
      setClipboardNote(`ব্রাউজার আটকে দিয়েছে — Ctrl+${cut ? "X" : "C"} চাপুন`);
    }
    setTimeout(() => setClipboardNote(null), 2500);
  };

  const doPaste = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        if (item.types.includes("text/html")) {
          const html = await (await item.getType("text/html")).text();
          editor.chain().focus().insertContent(html).run();
          return;
        }
      }
      const text = await navigator.clipboard.readText();
      editor.chain().focus().insertContent(text).run();
    } catch {
      setClipboardNote("ব্রাউজার আটকে দিয়েছে — Ctrl+V চাপুন");
      setTimeout(() => setClipboardNote(null), 2500);
    }
  };

  const currentSize = () => {
    const size = editor.getAttributes("textStyle").fontSize as string | undefined;
    return size ? size.replace("px", "") : "১৭";
  };

  const stepFontSize = (direction: 1 | -1) => {
    const raw = editor.getAttributes("textStyle").fontSize as string | undefined;
    const current = raw ? parseInt(raw, 10) : 17;
    const index = FONT_SIZES.findIndex((s) => s >= current);
    const nextIndex = Math.min(
      Math.max((index === -1 ? FONT_SIZES.length - 1 : index) + direction, 0),
      FONT_SIZES.length - 1,
    );
    editor.chain().focus().setFontSize(`${FONT_SIZES[nextIndex]}px`).run();
  };

  const activeFont = FONTS.find(
    (f) => f.value === editor.getAttributes("textStyle").fontFamily,
  );

  return (
    <div
      className="flex h-[74px] items-stretch overflow-x-auto"
      onMouseUp={runPainter}
    >
      {/* ---------------- clipboard ---------------- */}
      <Group label="ক্লিপবোর্ড">
        <Btn big title="পেস্ট (Ctrl+V)" onClick={doPaste}>
          <ClipboardPaste className="h-5 w-5" />
          পেস্ট
        </Btn>
        <Stack>
          <Btn title="কাট (Ctrl+X)" onClick={() => doCopy(true)}>
            <Scissors className="h-4 w-4" />
          </Btn>
          <Btn title="কপি (Ctrl+C)" onClick={() => doCopy(false)}>
            <Copy className="h-4 w-4" />
          </Btn>
        </Stack>
        <Btn
          big
          active={armed}
          title="ফরম্যাট পেইন্টার — একবার চাপুন, তারপর যে লেখায় বসাতে চান সেটা সিলেক্ট করুন"
          onClick={copyFormat}
        >
          <Brush className="h-5 w-5" />
          পেইন্টার
        </Btn>
      </Group>

      {/* ---------------- font ---------------- */}
      <Group label="ফন্ট">
        <Stack>
          <Row>
            <Dropdown label={activeFont?.label ?? "ফন্ট"} width="w-32" title="ফন্ট">
              {(close) => (
                <>
                  <MenuItem
                    onClick={() => {
                      editor.chain().focus().unsetFontFamily().run();
                      close();
                    }}
                  >
                    ডিফল্ট ফন্ট
                  </MenuItem>
                  {FONTS.map((f) => (
                    <MenuItem
                      key={f.label}
                      active={activeFont?.label === f.label}
                      style={{ fontFamily: f.value }}
                      onClick={() => {
                        editor.chain().focus().setFontFamily(f.value).run();
                        close();
                      }}
                    >
                      {f.label}
                    </MenuItem>
                  ))}
                </>
              )}
            </Dropdown>
            <Dropdown label={currentSize()} width="w-14" title="ফন্ট সাইজ">
              {(close) => (
                <>
                  <MenuItem
                    onClick={() => {
                      editor.chain().focus().unsetFontSize().run();
                      close();
                    }}
                  >
                    ডিফল্ট
                  </MenuItem>
                  {FONT_SIZES.map((s) => (
                    <MenuItem
                      key={s}
                      onClick={() => {
                        editor.chain().focus().setFontSize(`${s}px`).run();
                        close();
                      }}
                    >
                      {s}
                    </MenuItem>
                  ))}
                </>
              )}
            </Dropdown>
            <Btn title="ফন্ট বড় করুন" onClick={() => stepFontSize(1)}>
              <span className="text-sm font-bold">A</span>
            </Btn>
            <Btn title="ফন্ট ছোট করুন" onClick={() => stepFontSize(-1)}>
              <span className="text-[10px] font-bold">A</span>
            </Btn>
            <Dropdown label={<CaseSensitive className="h-4 w-4" />} width="w-11" title="ছোট/বড় হাতের অক্ষর" panelWidth="w-48">
              {(close) =>
                CASE_MODES.map((mode) => (
                  <MenuItem
                    key={mode.label}
                    onClick={() => {
                      transformSelection(editor, mode.fn);
                      close();
                    }}
                  >
                    {mode.label}
                  </MenuItem>
                ))
              }
            </Dropdown>
          </Row>
          <Row>
            <Btn
              title="Bold (Ctrl+B)"
              active={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-4 w-4" />
            </Btn>
            <Btn
              title="Italic (Ctrl+I)"
              active={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-4 w-4" />
            </Btn>
            <Btn
              title="Underline (Ctrl+U)"
              active={editor.isActive("underline")}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon className="h-4 w-4" />
            </Btn>
            <Btn
              title="Strikethrough"
              active={editor.isActive("strike")}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="h-4 w-4" />
            </Btn>
            <Btn
              title="Subscript (Ctrl+,)"
              active={editor.isActive("subscript")}
              onClick={() => editor.chain().focus().toggleSubscript().run()}
            >
              <SubIcon className="h-4 w-4" />
            </Btn>
            <Btn
              title="Superscript (Ctrl+.)"
              active={editor.isActive("superscript")}
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
            >
              <SupIcon className="h-4 w-4" />
            </Btn>
            <Dropdown
              label={<Baseline className="h-4 w-4" />}
              width="w-11"
              panelWidth="w-52"
              title="টেক্সট কালার"
            >
              {(close) => (
                <ColorGrid
                  resetLabel="স্বয়ংক্রিয় রঙ"
                  current={editor.getAttributes("textStyle").color as string}
                  onPick={(c) => {
                    editor.chain().focus().setColor(c).run();
                    close();
                  }}
                  onReset={() => {
                    editor.chain().focus().unsetColor().run();
                    close();
                  }}
                />
              )}
            </Dropdown>
            <Dropdown
              label={<Highlighter className="h-4 w-4" />}
              width="w-11"
              panelWidth="w-52"
              title="হাইলাইট"
            >
              {(close) => (
                <ColorGrid
                  resetLabel="হাইলাইট মুছুন"
                  current={editor.getAttributes("highlight").color as string}
                  onPick={(c) => {
                    editor.chain().focus().setHighlight({ color: c }).run();
                    close();
                  }}
                  onReset={() => {
                    editor.chain().focus().unsetHighlight().run();
                    close();
                  }}
                />
              )}
            </Dropdown>
            <Btn
              title="সব ফরম্যাট মুছুন"
              onClick={() =>
                editor.chain().focus().unsetAllMarks().clearNodes().run()
              }
            >
              <Eraser className="h-4 w-4" />
            </Btn>
          </Row>
        </Stack>
      </Group>

      {/* ---------------- paragraph ---------------- */}
      <Group label="প্যারাগ্রাফ">
        <Stack>
          <Row>
            <Btn
              title="বুলেট তালিকা"
              active={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="h-4 w-4" />
            </Btn>
            <Btn
              title="নম্বর তালিকা"
              active={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="h-4 w-4" />
            </Btn>
            <Btn
              title="চেকলিস্ট"
              active={editor.isActive("taskList")}
              onClick={() => editor.chain().focus().toggleTaskList().run()}
            >
              <ListChecks className="h-4 w-4" />
            </Btn>
            <Btn
              title="ইনডেন্ট কমান (Shift+Tab)"
              onClick={() => editor.chain().focus().outdent().run()}
            >
              <IndentDecrease className="h-4 w-4" />
            </Btn>
            <Btn
              title="ইনডেন্ট বাড়ান (Tab)"
              onClick={() => editor.chain().focus().indent().run()}
            >
              <IndentIncrease className="h-4 w-4" />
            </Btn>
            <Btn
              title="উদ্ধৃতি"
              active={editor.isActive("blockquote")}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <TextQuote className="h-4 w-4" />
            </Btn>
          </Row>
          <Row>
            <Btn
              title="বাম"
              active={editor.isActive({ textAlign: "left" })}
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
            >
              <AlignLeft className="h-4 w-4" />
            </Btn>
            <Btn
              title="মাঝ"
              active={editor.isActive({ textAlign: "center" })}
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
            >
              <AlignCenter className="h-4 w-4" />
            </Btn>
            <Btn
              title="ডান"
              active={editor.isActive({ textAlign: "right" })}
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
            >
              <AlignRight className="h-4 w-4" />
            </Btn>
            <Btn
              title="জাস্টিফাই"
              active={editor.isActive({ textAlign: "justify" })}
              onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            >
              <AlignJustify className="h-4 w-4" />
            </Btn>
            <Dropdown
              label={<UnfoldVertical className="h-4 w-4" />}
              width="w-11"
              panelWidth="w-44"
              title="লাইন ও প্যারা স্পেসিং"
            >
              {(close) => (
                <>
                  <p className="px-3 pb-1 pt-1 font-ui text-[10px] font-semibold uppercase text-foreground-muted">
                    লাইন স্পেসিং
                  </p>
                  {LINE_HEIGHTS.map((h) => (
                    <MenuItem
                      key={h}
                      active={editor.isActive({ lineHeight: h })}
                      onClick={() => {
                        editor.chain().focus().setLineHeight(h).run();
                        close();
                      }}
                    >
                      {h}
                    </MenuItem>
                  ))}
                  <MenuItem
                    onClick={() => {
                      editor.chain().focus().unsetLineHeight().run();
                      close();
                    }}
                  >
                    ডিফল্ট
                  </MenuItem>
                  <div className="my-1 border-t border-border" />
                  <p className="px-3 pb-1 font-ui text-[10px] font-semibold uppercase text-foreground-muted">
                    প্যারার পরে ফাঁকা
                  </p>
                  {["0", "0.5em", "1em", "1.5em", "2em"].map((s) => (
                    <MenuItem
                      key={s}
                      onClick={() => {
                        editor.chain().focus().setParagraphSpacing(s).run();
                        close();
                      }}
                    >
                      {s === "0" ? "নেই" : s}
                    </MenuItem>
                  ))}
                </>
              )}
            </Dropdown>
            <Dropdown
              label={<ChevronsLeftRight className="h-4 w-4" />}
              width="w-11"
              panelWidth="w-40"
              title="লেখার দিক"
            >
              {(close) => (
                <>
                  <MenuItem
                    onClick={() => {
                      editor.chain().focus().setBlockDirection("ltr").run();
                      close();
                    }}
                  >
                    বাম → ডান (LTR)
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      editor.chain().focus().setBlockDirection("rtl").run();
                      close();
                    }}
                  >
                    ডান → বাম (RTL)
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      editor.chain().focus().setBlockDirection(null).run();
                      close();
                    }}
                  >
                    ডিফল্ট
                  </MenuItem>
                </>
              )}
            </Dropdown>
          </Row>
        </Stack>
      </Group>

      {/* ---------------- styles ---------------- */}
      <Group label="স্টাইল">
        <Dropdown label="স্টাইল গ্যালারি" width="w-36" panelWidth="w-52" title="স্টাইল">
          {(close) =>
            STYLES.map((style) => (
              <MenuItem
                key={style.label}
                style={style.css}
                onClick={() => {
                  style.apply(editor);
                  close();
                }}
              >
                {style.label}
              </MenuItem>
            ))
          }
        </Dropdown>
      </Group>

      {/* ---------------- editing ---------------- */}
      <Group label="এডিটিং">
        <Btn big title="খুঁজুন ও বদলান (Ctrl+F)" onClick={onOpenFind}>
          <Search className="h-5 w-5" />
          খুঁজুন
        </Btn>
        <Btn
          big
          title="সব সিলেক্ট করুন (Ctrl+A)"
          onClick={() => editor.chain().focus().selectAll().run()}
        >
          <span className="text-base font-bold">⌗</span>
          সব সিলেক্ট
        </Btn>
      </Group>

      {clipboardNote && (
        <div
          onMouseDown={keepFocus}
          className="pointer-events-none absolute bottom-1 left-1/2 z-50 -translate-x-1/2 rounded bg-brand-navy px-3 py-1 font-ui text-[11px] text-white shadow-lg"
        >
          {clipboardNote}
        </div>
      )}
    </div>
  );
}
