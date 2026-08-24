"use client";

import { useState } from "react";
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
import { FONT_SIZES, LINE_HEIGHTS } from "./extensions";
import { FontPicker } from "./FontPicker";
import { StyleGallery } from "./StyleGallery";
import { useFormatPainter } from "./use-format-painter";
import { copySelection, pasteIntoEditor } from "./clipboard";
import { useAdminText } from "@/lib/admin-strings";

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
  const ax = useAdminText();
  const { armed, copyFormat } = useFormatPainter(editor);
  const [note, setNote] = useState<string | null>(null);

  const flash = (message: string) => {
    setNote(message);
    setTimeout(() => setNote(null), 3500);
  };

  const doCopy = async (cut: boolean) => {
    flash((await copySelection(editor, cut)).message);
  };

  const doPaste = async (plainText: boolean) => {
    const result = await pasteIntoEditor(editor, plainText);
    if (!result.ok) flash(result.message);
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

  const activeSize = editor.getAttributes("textStyle").fontSize as
    | string
    | undefined;

  return (
    <div className="relative flex h-[92px] items-stretch overflow-x-auto bg-white">
      {/* ---------------- Clipboard ---------------- */}
      {/* No dialog launcher here — Word's opens a clipboard history pane we
          don't have, and pointing it at Paste would just duplicate the button. */}
      <Group label="Clipboard">
        <BigBtn
          title={ax("পেস্ট (Ctrl+V)")}
          label="Paste"
          icon={<ClipboardPaste className="h-5 w-5" />}
          onClick={() => doPaste(false)}
          menu={(close) => (
            <>
              <MenuHeading>{ax("পেস্ট করার ধরন")}</MenuHeading>
              <MenuItem
                onClick={() => {
                  doPaste(false);
                  close();
                }}
              >
                {ax("ফরম্যাট সহ")}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  doPaste(true);
                  close();
                }}
              >
                {ax("শুধু লেখা (ফরম্যাট ছাড়া)")}
              </MenuItem>
            </>
          )}
        />
        <Stack>
          <LabelBtn
            title={ax("কাট (Ctrl+X)")}
            label="Cut"
            icon={<Scissors className="h-3.5 w-3.5" />}
            onClick={() => doCopy(true)}
          />
          <LabelBtn
            title={ax("কপি (Ctrl+C)")}
            label="Copy"
            icon={<Copy className="h-3.5 w-3.5" />}
            onClick={() => doCopy(false)}
          />
          <LabelBtn
            title={ax("ফরম্যাট পেইন্টার — চাপুন, তারপর যেখানে বসাবেন সিলেক্ট করুন")}
            label="Format Painter"
            icon={<Brush className="h-3.5 w-3.5" />}
            active={armed}
            onClick={copyFormat}
          />
        </Stack>
      </Group>

      {/* ---------------- Font ---------------- */}
      <Group label="Font" launchTitle={ax("ফন্ট ডায়ালগ")} onLaunch={onOpenFontDialog}>
        <Stack>
          <Row>
            <FontPicker editor={editor} />
            <Combo
              label={activeSize ? parseInt(activeSize, 10) : 17}
              width="w-14"
              panelWidth={92}
              title={ax("ফন্ট সাইজ")}
            >
              {(close) => (
                <>
                  <MenuItem
                    onClick={() => {
                      editor.chain().focus().unsetFontSize().run();
                      close();
                    }}
                  >
                    {ax("ডিফল্ট")}
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
            <Btn title={ax("ফন্ট বড় করুন")} onClick={() => stepFontSize(1)}>
              <span className="text-[13px] font-bold leading-none">A</span>
            </Btn>
            <Btn title={ax("ফন্ট ছোট করুন")} onClick={() => stepFontSize(-1)}>
              <span className="text-[9px] font-bold leading-none">A</span>
            </Btn>
            <IconCombo
              title={ax("ছোট/বড় হাতের অক্ষর")}
              icon={<span className="px-0.5 text-[11px] font-semibold">Aa</span>}
              panelWidth={192}
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
              title={ax("সব ফরম্যাট মুছুন")}
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
              title={ax("হাইলাইট")}
              icon={<Highlighter className="h-3.5 w-3.5" />}
            >
              {(close) => (
                <ColorGrid
                  resetLabel={ax("হাইলাইট মুছুন")}
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
              title={ax("ফন্টের রঙ")}
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
                  resetLabel={ax("স্বয়ংক্রিয় রঙ")}
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
        label="Paragraph"
        launchTitle={ax("প্যারাগ্রাফ ডায়ালগ")}
        onLaunch={onOpenParagraphDialog}
      >
        <Stack>
          <Row>
            <Btn
              title={ax("বুলেট তালিকা")}
              active={editor.isActive("bulletList")}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            >
              <List className="h-3.5 w-3.5" />
            </Btn>
            <Btn
              title={ax("নম্বর তালিকা")}
              active={editor.isActive("orderedList")}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </Btn>
            <Btn
              title={ax("চেকলিস্ট")}
              active={editor.isActive("taskList")}
              onClick={() => editor.chain().focus().toggleTaskList().run()}
            >
              <ListChecks className="h-3.5 w-3.5" />
            </Btn>
            <Btn
              title={ax("ইনডেন্ট কমান (Shift+Tab)")}
              onClick={() => editor.chain().focus().outdent().run()}
            >
              <IndentDecrease className="h-3.5 w-3.5" />
            </Btn>
            <Btn
              title={ax("ইনডেন্ট বাড়ান (Tab)")}
              onClick={() => editor.chain().focus().indent().run()}
            >
              <IndentIncrease className="h-3.5 w-3.5" />
            </Btn>
            <Btn
              title={ax("উদ্ধৃতি")}
              active={editor.isActive("blockquote")}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            >
              <TextQuote className="h-3.5 w-3.5" />
            </Btn>
          </Row>
          <Row>
            <Btn
              title={ax("বাম")}
              active={editor.isActive({ textAlign: "left" })}
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
            >
              <AlignLeft className="h-3.5 w-3.5" />
            </Btn>
            <Btn
              title={ax("মাঝ")}
              active={editor.isActive({ textAlign: "center" })}
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
            >
              <AlignCenter className="h-3.5 w-3.5" />
            </Btn>
            <Btn
              title={ax("ডান")}
              active={editor.isActive({ textAlign: "right" })}
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
            >
              <AlignRight className="h-3.5 w-3.5" />
            </Btn>
            <Btn
              title={ax("জাস্টিফাই")}
              active={editor.isActive({ textAlign: "justify" })}
              onClick={() =>
                editor.chain().focus().setTextAlign("justify").run()
              }
            >
              <AlignJustify className="h-3.5 w-3.5" />
            </Btn>
            <IconCombo
              title={ax("লাইন ও প্যারা স্পেসিং")}
              icon={<UnfoldVertical className="h-3.5 w-3.5" />}
              panelWidth={176}
            >
              {(close) => (
                <>
                  <MenuHeading>{ax("লাইন স্পেসিং")}</MenuHeading>
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
                    {ax("ডিফল্ট")}
                  </MenuItem>
                  <MenuHeading>{ax("প্যারার পরে ফাঁকা")}</MenuHeading>
                  {["0", "0.5em", "1em", "1.5em", "2em"].map((s) => (
                    <MenuItem
                      key={s}
                      onClick={() => {
                        editor.chain().focus().setParagraphSpacing(s).run();
                        close();
                      }}
                    >
                      {s === "0" ? ax("নেই") : s}
                    </MenuItem>
                  ))}
                </>
              )}
            </IconCombo>
            <IconCombo
              title={ax("লেখার দিক")}
              icon={<ChevronsLeftRight className="h-3.5 w-3.5" />}
              panelWidth={160}
            >
              {(close) => (
                <>
                  <MenuItem
                    onClick={() => {
                      editor.chain().focus().setBlockDirection("ltr").run();
                      close();
                    }}
                  >
                    {ax("বাম → ডান (LTR)")}
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      editor.chain().focus().setBlockDirection("rtl").run();
                      close();
                    }}
                  >
                    {ax("ডান → বাম (RTL)")}
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      editor.chain().focus().setBlockDirection(null).run();
                      close();
                    }}
                  >
                    {ax("ডিফল্ট")}
                  </MenuItem>
                </>
              )}
            </IconCombo>
          </Row>
        </Stack>
      </Group>

      {/* ---------------- Styles ---------------- */}
      <Group label="Styles">
        <StyleGallery editor={editor} />
      </Group>

      {/* ---------------- Editing ---------------- */}
      <Group label="Editing">
        <Stack>
          <LabelBtn
            title={ax("খুঁজুন (Ctrl+F)")}
            label="Find"
            icon={<Search className="h-3.5 w-3.5" />}
            onClick={() => onOpenFind(false)}
          />
          <LabelBtn
            title={ax("বদলান (Ctrl+H)")}
            label="Replace"
            icon={<Replace className="h-3.5 w-3.5" />}
            onClick={() => onOpenFind(true)}
          />
          <LabelBtn
            title={ax("সব সিলেক্ট করুন (Ctrl+A)")}
            label="Select All"
            icon={<MousePointerSquareDashed className="h-3.5 w-3.5" />}
            onClick={() => editor.chain().focus().selectAll().run()}
          />
        </Stack>
      </Group>

      {note && (
        <div
          onMouseDown={keepFocus}
          className="pointer-events-none absolute bottom-1 left-1/2 z-50 -translate-x-1/2 rounded bg-[#14181f] px-3 py-1 font-ui text-[11px] text-white shadow-lg"
        >
          {note}
        </div>
      )}
    </div>
  );
}
