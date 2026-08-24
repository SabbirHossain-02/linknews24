"use client";

import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  Bold,
  ClipboardPaste,
  Columns3,
  Combine,
  Copy,
  Eraser,
  Highlighter,
  Image as ImageIcon,
  IndentDecrease,
  IndentIncrease,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  ListTodo,
  Rows3,
  Scissors,
  Search,
  Split,
  Strikethrough,
  Subscript,
  Superscript,
  Table as TableIcon,
  Trash2,
  Type,
  Underline as UnderlineIcon,
  Unlink,
  Volume2,
} from "lucide-react";
import { CmdHeading, CmdItem, CmdSep, CmdSub, ContextMenu } from "./ContextMenu";
import { copySelection, pasteIntoEditor } from "./clipboard";
import { findTable, moveTableBy } from "./table-tools";
import type { FigureAlign } from "./figure";

const WRAPS: { value: FigureAlign; label: string }[] = [
  { value: "center", label: "মাঝে, নিজের লাইনে" },
  { value: "left", label: "বামে" },
  { value: "right", label: "ডানে" },
  { value: "wrap-left", label: "বামে, চারপাশে লেখা" },
  { value: "wrap-right", label: "ডানে, চারপাশে লেখা" },
];

/**
 * Word's right-click menu.
 *
 * It shows what applies where the pointer is: the clipboard and formatting rows
 * always, the table rows only inside a table, the picture rows only on a
 * picture. That is the whole point of a context menu — the commands that are
 * hardest to find on the ribbon are the ones you reach for with the mouse
 * already on the thing you want to change.
 */
export function EditorContextMenu({
  editor,
  x,
  y,
  onClose,
  onOpenFind,
  onOpenDialog,
  onReadAloud,
  canReadAloud,
  onNotice,
}: {
  editor: Editor;
  x: number;
  y: number;
  onClose: () => void;
  onOpenFind: () => void;
  onOpenDialog: (kind: "font" | "paragraph" | "link" | "image" | "table") => void;
  onReadAloud: () => void;
  canReadAloud: boolean;
  /** Shows the result of a clipboard command, which can fail on plain http. */
  onNotice: (message: string) => void;
}) {
  const inTable = !!findTable(editor);
  const inFigure = editor.isActive("figure");
  const hasSelection = !editor.state.selection.empty;
  const inLink = editor.isActive("link");
  const figureWidth = (editor.getAttributes("figure").width as number) ?? 100;

  /** Run a command, then get out of the way. */
  const run = (fn: () => void) => () => {
    fn();
    onClose();
  };

  const clipboard = (fn: () => Promise<{ ok: boolean; message: string }>) =>
    run(() => {
      void fn().then((r) => onNotice(r.message));
    });

  const chain = () => editor.chain().focus();

  return (
    <ContextMenu x={x} y={y} onClose={onClose}>
      {/* ---------------- clipboard ---------------- */}
      <CmdItem
        label="কাট"
        shortcut="Ctrl+X"
        icon={<Scissors className="h-3.5 w-3.5" />}
        disabled={!hasSelection}
        onClick={clipboard(() => copySelection(editor, true))}
      />
      <CmdItem
        label="কপি"
        shortcut="Ctrl+C"
        icon={<Copy className="h-3.5 w-3.5" />}
        disabled={!hasSelection}
        onClick={clipboard(() => copySelection(editor, false))}
      />
      <CmdItem
        label="পেস্ট"
        shortcut="Ctrl+V"
        icon={<ClipboardPaste className="h-3.5 w-3.5" />}
        onClick={clipboard(() => pasteIntoEditor(editor, false))}
      />
      <CmdItem
        label="সাদা লেখা হিসেবে পেস্ট"
        icon={<Type className="h-3.5 w-3.5" />}
        onClick={clipboard(() => pasteIntoEditor(editor, true))}
      />

      <CmdSep />

      {/* ---------------- formatting ---------------- */}
      <CmdSub label="ফরম্যাট" icon={<Bold className="h-3.5 w-3.5" />}>
        <CmdItem
          label="মোটা"
          shortcut="Ctrl+B"
          icon={<Bold className="h-3.5 w-3.5" />}
          onClick={run(() => chain().toggleBold().run())}
        />
        <CmdItem
          label="বাঁকা"
          shortcut="Ctrl+I"
          icon={<Italic className="h-3.5 w-3.5" />}
          onClick={run(() => chain().toggleItalic().run())}
        />
        <CmdItem
          label="আন্ডারলাইন"
          shortcut="Ctrl+U"
          icon={<UnderlineIcon className="h-3.5 w-3.5" />}
          onClick={run(() => chain().toggleUnderline().run())}
        />
        <CmdItem
          label="কাটা দাগ"
          icon={<Strikethrough className="h-3.5 w-3.5" />}
          onClick={run(() => chain().toggleStrike().run())}
        />
        <CmdItem
          label="হাইলাইট"
          icon={<Highlighter className="h-3.5 w-3.5" />}
          onClick={run(() => chain().toggleHighlight().run())}
        />
        <CmdSep />
        <CmdItem
          label="নিচের ঘর"
          icon={<Subscript className="h-3.5 w-3.5" />}
          onClick={run(() => chain().toggleSubscript().run())}
        />
        <CmdItem
          label="উপরের ঘর"
          icon={<Superscript className="h-3.5 w-3.5" />}
          onClick={run(() => chain().toggleSuperscript().run())}
        />
      </CmdSub>

      <CmdSub label="সাজানো" icon={<AlignLeft className="h-3.5 w-3.5" />}>
        <CmdItem
          label="বাঁ দিকে"
          icon={<AlignLeft className="h-3.5 w-3.5" />}
          onClick={run(() => chain().setTextAlign("left").run())}
        />
        <CmdItem
          label="মাঝে"
          icon={<AlignCenter className="h-3.5 w-3.5" />}
          onClick={run(() => chain().setTextAlign("center").run())}
        />
        <CmdItem
          label="ডান দিকে"
          icon={<AlignRight className="h-3.5 w-3.5" />}
          onClick={run(() => chain().setTextAlign("right").run())}
        />
        <CmdItem
          label="দুই পাশ সমান"
          icon={<AlignJustify className="h-3.5 w-3.5" />}
          onClick={run(() => chain().setTextAlign("justify").run())}
        />
        <CmdSep />
        <CmdItem
          label="ইনডেন্ট বাড়ান"
          shortcut="Tab"
          icon={<IndentIncrease className="h-3.5 w-3.5" />}
          onClick={run(() => chain().indent().run())}
        />
        <CmdItem
          label="ইনডেন্ট কমান"
          shortcut="Shift+Tab"
          icon={<IndentDecrease className="h-3.5 w-3.5" />}
          onClick={run(() => chain().outdent().run())}
        />
      </CmdSub>

      <CmdSub label="তালিকা" icon={<List className="h-3.5 w-3.5" />}>
        <CmdItem
          label="বুলেট তালিকা"
          icon={<List className="h-3.5 w-3.5" />}
          onClick={run(() => chain().toggleBulletList().run())}
        />
        <CmdItem
          label="নম্বর তালিকা"
          icon={<ListOrdered className="h-3.5 w-3.5" />}
          onClick={run(() => chain().toggleOrderedList().run())}
        />
        <CmdItem
          label="টিক-বক্স তালিকা"
          icon={<ListTodo className="h-3.5 w-3.5" />}
          onClick={run(() => chain().toggleTaskList().run())}
        />
      </CmdSub>

      <CmdItem
        label="ফন্ট…"
        icon={<Type className="h-3.5 w-3.5" />}
        onClick={run(() => onOpenDialog("font"))}
      />
      <CmdItem
        label="অনুচ্ছেদ…"
        icon={<AlignJustify className="h-3.5 w-3.5" />}
        onClick={run(() => onOpenDialog("paragraph"))}
      />
      <CmdItem
        label="সব ফরম্যাট মুছুন"
        icon={<Eraser className="h-3.5 w-3.5" />}
        onClick={run(() => chain().unsetAllMarks().clearNodes().run())}
      />

      <CmdSep />

      {/* ---------------- link ---------------- */}
      <CmdItem
        label={inLink ? "লিংক বদলান…" : "লিংক দিন…"}
        shortcut="Ctrl+K"
        icon={<LinkIcon className="h-3.5 w-3.5" />}
        onClick={run(() => onOpenDialog("link"))}
      />
      {inLink && (
        <CmdItem
          label="লিংক তুলে দিন"
          icon={<Unlink className="h-3.5 w-3.5" />}
          onClick={run(() => chain().unsetLink().run())}
        />
      )}

      {/* ---------------- picture ---------------- */}
      {inFigure && (
        <>
          <CmdSep />
          <CmdHeading>ছবি</CmdHeading>
          <CmdSub label="অবস্থান" icon={<ImageIcon className="h-3.5 w-3.5" />}>
            {WRAPS.map((w) => (
              <CmdItem
                key={w.value}
                label={w.label}
                onClick={run(() => chain().updateFigure({ align: w.value }).run())}
              />
            ))}
          </CmdSub>
          <CmdSub label={`চওড়া — ${figureWidth}%`}>
            {[25, 33, 50, 66, 75, 100].map((w) => (
              <CmdItem
                key={w}
                label={`${w}%`}
                onClick={run(() => chain().updateFigure({ width: w }).run())}
              />
            ))}
          </CmdSub>
          <CmdItem
            label="ছবিটি বদলান…"
            icon={<ImageIcon className="h-3.5 w-3.5" />}
            onClick={run(() => onOpenDialog("image"))}
          />
          <CmdItem
            label="ছবিটি মুছুন"
            danger
            icon={<Trash2 className="h-3.5 w-3.5" />}
            onClick={run(() => chain().deleteSelection().run())}
          />
        </>
      )}

      {/* ---------------- table ---------------- */}
      {inTable ? (
        <>
          <CmdSep />
          <CmdHeading>টেবিল</CmdHeading>
          <CmdSub label="সারি" icon={<Rows3 className="h-3.5 w-3.5" />}>
            <CmdItem
              label="উপরে সারি যোগ করুন"
              icon={<ArrowUp className="h-3.5 w-3.5" />}
              onClick={run(() => chain().addRowBefore().run())}
            />
            <CmdItem
              label="নিচে সারি যোগ করুন"
              icon={<ArrowDown className="h-3.5 w-3.5" />}
              onClick={run(() => chain().addRowAfter().run())}
            />
            <CmdItem
              label="এই সারিটি মুছুন"
              danger
              icon={<Trash2 className="h-3.5 w-3.5" />}
              onClick={run(() => chain().deleteRow().run())}
            />
          </CmdSub>
          <CmdSub label="কলাম" icon={<Columns3 className="h-3.5 w-3.5" />}>
            <CmdItem
              label="বামে কলাম যোগ করুন"
              onClick={run(() => chain().addColumnBefore().run())}
            />
            <CmdItem
              label="ডানে কলাম যোগ করুন"
              onClick={run(() => chain().addColumnAfter().run())}
            />
            <CmdItem
              label="এই কলামটি মুছুন"
              danger
              icon={<Trash2 className="h-3.5 w-3.5" />}
              onClick={run(() => chain().deleteColumn().run())}
            />
          </CmdSub>
          <CmdItem
            label="ঘরগুলো জোড়া দিন"
            icon={<Combine className="h-3.5 w-3.5" />}
            onClick={run(() => chain().mergeCells().run())}
          />
          <CmdItem
            label="ঘরটি আলাদা করুন"
            icon={<Split className="h-3.5 w-3.5" />}
            onClick={run(() => chain().splitCell().run())}
          />
          <CmdItem
            label="টেবিলটি উপরে সরান"
            icon={<ArrowUp className="h-3.5 w-3.5" />}
            onClick={run(() => moveTableBy(editor, -1))}
          />
          <CmdItem
            label="টেবিলটি নিচে সরান"
            icon={<ArrowDown className="h-3.5 w-3.5" />}
            onClick={run(() => moveTableBy(editor, 1))}
          />
          <CmdItem
            label="পুরো টেবিল মুছুন"
            danger
            icon={<Trash2 className="h-3.5 w-3.5" />}
            onClick={run(() => chain().deleteTable().run())}
          />
        </>
      ) : (
        <CmdItem
          label="টেবিল বসান…"
          icon={<TableIcon className="h-3.5 w-3.5" />}
          onClick={run(() => onOpenDialog("table"))}
        />
      )}

      <CmdSep />

      {canReadAloud && (
        <CmdItem
          label="পড়ে শোনাও"
          icon={<Volume2 className="h-3.5 w-3.5" />}
          onClick={run(onReadAloud)}
        />
      )}
      <CmdItem
        label="খুঁজুন ও বদলান…"
        shortcut="Ctrl+F"
        icon={<Search className="h-3.5 w-3.5" />}
        onClick={run(onOpenFind)}
      />
    </ContextMenu>
  );
}
