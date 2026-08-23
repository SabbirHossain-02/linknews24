"use client";

import { useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Brush,
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
  MousePointerSquareDashed,
  Replace,
  Scissors,
  Search,
  Strikethrough,
  Subscript as SubIcon,
  Superscript as SupIcon,
  TextQuote,
  Underline as UnderlineIcon,
  UnfoldVertical,
} from "lucide-react";
import {
  BigBtn,
  Btn,
  ColorGrid,
  Combo,
  Group,
  IconCombo,
  LabelBtn,
  MenuHeading,
  MenuItem,
  Row,
  Stack,
  keepFocus,
} from "./ui";
import { FONTS, FONT_SIZES, LINE_HEIGHTS } from "./extensions";
import { StyleGallery } from "./StyleGallery";
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

export function HomeTab({
  editor,
  onOpenFind,
  onOpenFontDialog,
  onOpenParagraphDialog,
}: {
  editor: Editor;
  onOpenFind: (replace?: boolean) => void;
  onOpenFontDialog: () => void;
  onOpenParagraphDialog: () => void;
}) {
  const { armed, copyFormat, paint } = useFormatPainter(editor);
  const [note, setNote] = useState<string | null>(null);
  const painterRef = useRef(paint);
  painterRef.current = paint;

  const flash = (message: string) => {
    setNote(message);
    setTimeout(() => setNote(null), 2500);
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
    if (from === to) return flash("আগে লেখা সিলেক্ট করুন");
    const text = editor.state.doc.textBetween(from, to, "\n");
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([selectedHTML()], { type: "text/html" }),
          "text/plain": new Blob([text], { type: "text/plain" }),
        }),
      ]);
      if (cut) editor.chain().focus().deleteSelection().run();
      flash(cut ? "কাট হয়েছে" : "কপি হয়েছে");
    } catch {
      flash(`ব্রাউজার আটকে দিয়েছে — Ctrl+${cut ? "X" : "C"} চাপুন`);
    }
  };

  const doPaste = async (plainText: boolean) => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        if (!plainText && item.types.includes("text/html")) {
          const html = await (await item.getType("text/html")).text();
          editor.chain().focus().insertContent(html).run();
          return;
        }
      }
      const text = await navigator.clipboard.readText();
      editor.chain().focus().insertContent(text).run();
    } catch {
      flash("ব্রাউজার আটকে দিয়েছে — Ctrl+V চাপুন");
    }
  };

  const stepFontSize = (direction: 1 | -1) => {
    const raw = editor.getAttributes("textStyle").fontSize as string | undefined;
    const current = raw ? parseInt(raw, 10) : 17;
    const index = FONT_SIZES.findIndex((s) => s >= current);
    const next = Math.min(
      Math.max((index === -1 ? FONT_SIZES.length - 1 : index) + direction, 0),
      FONT_SIZES.length - 1,
    );
    editor.chain().focus().setFontSize(`${FONT_SIZES[next]}px`).run();
  };

  const activeFont = FONTS.find(
    (f) => f.value === editor.getAttributes("textStyle").fontFamily,
  );
  const activeSize = editor.getAttributes("textStyle").fontSize as
    | string
    | undefined;

  return (
    <div
      className="relative flex h-[92px] items-stretch overflow-x-auto bg-white"
      onMouseUp={() => armed && painterRef.current()}
    >
      {/* ---------------- Clipboard ---------------- */}
      <Group
        label="ক্লিপবোর্ড"
        launchTitle="ক্লিপবোর্ড"
        onLaunch={() => doPaste(false)}
      >
        <BigBtn
          title="পেস্ট (Ctrl+V)"
          label="পেস্ট"
          icon={<ClipboardPaste className="h-5 w-5" />}
          onClick={() => doPaste(false)}
          menu={(close) => (
            <>
              <MenuHeading>পেস্ট করার ধরন</MenuHeading>
              <MenuItem
                onClick={() => {
                  doPaste(false);
                  close();
                }}
              >
                ফরম্যাট সহ
              </MenuItem>
              <MenuItem
                onClick={() => {
                  doPaste(true);
                  close();
                }}
              >
                শুধু লেখা (ফরম্যাট ছাড়া)
              </MenuItem>
            </>
          )}
        />
        <Stack>
          <LabelBtn
            title="কাট (Ctrl+X)"
            label="কাট"
            icon={<Scissors className="h-3.5 w-3.5" />}
            onClick={() => doCopy(true)}
          />
          <LabelBtn
            title="কপি (Ctrl+C)"
            label="কপি"
            icon={<Copy className="h-3.5 w-3.5" />}
            onClick={() => doCopy(false)}
          />
          <LabelBtn
            title="ফরম্যাট পেইন্টার — চাপুন, তারপর যেখানে বসাবেন সিলেক্ট করুন"
            label="ফরম্যাট পেইন্টার"
            icon={<Brush className="h-3.5 w-3.5" />}
            active={armed}
            onClick={copyFormat}
          />
        </Stack>
      </Group>

      {/* ---------------- Font ---------------- */}
      <Group label="ফন্ট" launchTitle="ফন্ট ডায়ালগ" onLaunch={onOpenFontDialog}>
        <Stack>
          <Row>
            <Combo
              label={activeFont?.label ?? "ডিফল্ট ফন্ট"}
              width="w-36"
              title="ফন্ট"
            >
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
            </Combo>
            <Combo
              label={activeSize ? parseInt(activeSize, 10) : 17}
              width="w-14"
              title="ফন্ট সাইজ"
            >
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
            </Combo>
            <Btn title="ফন্ট বড় করুন" onClick={() => stepFontSize(1)}>
              <span className="text-[13px] font-bold leading-none">A</span>
            </Btn>
            <Btn title="ফন্ট ছোট করুন" onClick={() => stepFontSize(-1)}>
              <span className="text-[9px] font-bold leading-none">A</span>
            </Btn>
            <IconCombo
              title="ছোট/বড় হাতের অক্ষর"
              icon={<span className="px-0.5 text-[11px] font-semibold">Aa</span>}
              panelWidth="w-48"
            >
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
            </IconCombo>
            <Btn
              title="সব ফরম্যাট মুছুন"
              onClick={() =>
                editor.chain().focus().unsetAllMarks().clearNodes().run()
              }
            >
              <Eraser className="h-3.5 w-3.5" />
            </Btn>
          </Row>

          <Row>
            <Btn
              title="Bold (Ctrl+B)"
              active={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-3.5 w-3.5" />
            </Btn>
            <Btn
              title="Italic (Ctrl+I)"
              active={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-3.5 w-3.5" />
            </Btn>
            <Btn
              title="Underline (Ctrl+U)"
              active={editor.isActive("underline")}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon className="h-3.5 w-3.5" />
            </Btn>
            <Btn
              title="Strikethrough"
              active={editor.isActive("strike")}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="h-3.5 w-3.5" />
            </Btn>
            <Btn
              title="Subscript"
              active={editor.isActive("subscript")}
              onClick={() => editor.chain().focus().toggleSubscript().run()}
            >
              <SubIcon className="h-3.5 w-3.5" />
            </Btn>
            <Btn
              title="Superscript"
              active={editor.isActive("superscript")}
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
            >
              <SupIcon className="h-3.5 w-3.5" />
            </Btn>
            <IconCombo
              title="হাইলাইট"
              icon={<Highlighter className="h-3.5 w-3.5" />}
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
            </IconCombo>
            <IconCombo
              title="ফন্টের রঙ"
              icon={
                <span
                  className="flex h-3.5 w-3.5 flex-col items-center justify-center text-[10px] font-bold leading-none"
                  style={{
                    color:
                      (editor.getAttributes("textStyle").color as string) ??
                      "#c00000",
                  }}
                >
                  A
                </span>
              }
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
            </IconCombo>
          </Row>
        </Stack>
      </Group>

      {/* ---------------- Paragraph ---------------- */}
      <Group
        label="প্যারাগ্রাফ"
        launchTitle="প্যারাগ্রাফ ডায়ালগ"
        onLaunch={onOpenParagraphDialog}
      >
        <Stack>
          <Row>
            <Btn
              title="বুলেট তালিকা"
              active={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="h-3.5 w-3.5" />
            </Btn>
            <Btn
              title="নম্বর তালিকা"
              active={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </Btn>
            <Btn
              title="চেকলিস্ট"
              active={editor.isActive("taskList")}
              onClick={() => editor.chain().focus().toggleTaskList().run()}
            >
              <ListChecks className="h-3.5 w-3.5" />
            </Btn>
            <Btn
              title="ইনডেন্ট কমান (Shift+Tab)"
              onClick={() => editor.chain().focus().outdent().run()}
            >
              <IndentDecrease className="h-3.5 w-3.5" />
            </Btn>
            <Btn
              title="ইনডেন্ট বাড়ান (Tab)"
              onClick={() => editor.chain().focus().indent().run()}
            >
              <IndentIncrease className="h-3.5 w-3.5" />
            </Btn>
            <Btn
              title="উদ্ধৃতি"
              active={editor.isActive("blockquote")}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <TextQuote className="h-3.5 w-3.5" />
            </Btn>
          </Row>
          <Row>
            <Btn
              title="বাম"
              active={editor.isActive({ textAlign: "left" })}
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
            >
              <AlignLeft className="h-3.5 w-3.5" />
            </Btn>
            <Btn
              title="মাঝ"
              active={editor.isActive({ textAlign: "center" })}
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
            >
              <AlignCenter className="h-3.5 w-3.5" />
            </Btn>
            <Btn
              title="ডান"
              active={editor.isActive({ textAlign: "right" })}
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
            >
              <AlignRight className="h-3.5 w-3.5" />
            </Btn>
            <Btn
              title="জাস্টিফাই"
              active={editor.isActive({ textAlign: "justify" })}
              onClick={() =>
                editor.chain().focus().setTextAlign("justify").run()
              }
            >
              <AlignJustify className="h-3.5 w-3.5" />
            </Btn>
            <IconCombo
              title="লাইন ও প্যারা স্পেসিং"
              icon={<UnfoldVertical className="h-3.5 w-3.5" />}
              panelWidth="w-44"
            >
              {(close) => (
                <>
                  <MenuHeading>লাইন স্পেসিং</MenuHeading>
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
                  <MenuHeading>প্যারার পরে ফাঁকা</MenuHeading>
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
            </IconCombo>
            <IconCombo
              title="লেখার দিক"
              icon={<ChevronsLeftRight className="h-3.5 w-3.5" />}
              panelWidth="w-40"
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
            </IconCombo>
          </Row>
        </Stack>
      </Group>

      {/* ---------------- Styles ---------------- */}
      <Group label="স্টাইল">
        <StyleGallery editor={editor} />
      </Group>

      {/* ---------------- Editing ---------------- */}
      <Group label="এডিটিং">
        <Stack>
          <LabelBtn
            title="খুঁজুন (Ctrl+F)"
            label="খুঁজুন"
            icon={<Search className="h-3.5 w-3.5" />}
            onClick={() => onOpenFind(false)}
          />
          <LabelBtn
            title="বদলান (Ctrl+H)"
            label="বদলান"
            icon={<Replace className="h-3.5 w-3.5" />}
            onClick={() => onOpenFind(true)}
          />
          <LabelBtn
            title="সব সিলেক্ট করুন (Ctrl+A)"
            label="সব সিলেক্ট"
            icon={<MousePointerSquareDashed className="h-3.5 w-3.5" />}
            onClick={() => editor.chain().focus().selectAll().run()}
          />
        </Stack>
      </Group>

      {note && (
        <div
          onMouseDown={keepFocus}
          className="pointer-events-none absolute bottom-1 left-1/2 z-50 -translate-x-1/2 rounded bg-[#2b579a] px-3 py-1 font-ui text-[11px] text-white shadow-lg"
        >
          {note}
        </div>
      )}
    </div>
  );
}
