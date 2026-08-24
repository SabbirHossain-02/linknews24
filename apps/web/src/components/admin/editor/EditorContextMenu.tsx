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
  { value: "center", label: "In Line, Centred" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
  { value: "wrap-left", label: "Left, Wrap Text" },
  { value: "wrap-right", label: "Right, Wrap Text" },
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
  bounds,
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
  /** The editor page area — the menu never leaves it. */
  bounds: HTMLElement | null;
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
    <ContextMenu x={x} y={y} bounds={bounds} onClose={onClose}>
      {/* ---------------- clipboard ---------------- */}
      <CmdItem
        label="Cut"
        shortcut="Ctrl+X"
        icon={<Scissors className="h-3.5 w-3.5" />}
        disabled={!hasSelection}
        onClick={clipboard(() => copySelection(editor, true))}
      />
      <CmdItem
        label="Copy"
        shortcut="Ctrl+C"
        icon={<Copy className="h-3.5 w-3.5" />}
        disabled={!hasSelection}
        onClick={clipboard(() => copySelection(editor, false))}
      />
      <CmdItem
        label="Paste"
        shortcut="Ctrl+V"
        icon={<ClipboardPaste className="h-3.5 w-3.5" />}
        onClick={clipboard(() => pasteIntoEditor(editor, false))}
      />
      <CmdItem
        label="Paste as Plain Text"
        icon={<Type className="h-3.5 w-3.5" />}
        onClick={clipboard(() => pasteIntoEditor(editor, true))}
      />

      <CmdSep />

      {/* ---------------- formatting ---------------- */}
      <CmdSub label="Format" icon={<Bold className="h-3.5 w-3.5" />}>
        <CmdItem
          label="Bold"
          shortcut="Ctrl+B"
          icon={<Bold className="h-3.5 w-3.5" />}
          onClick={run(() => chain().toggleBold().run())}
        />
        <CmdItem
          label="Italic"
          shortcut="Ctrl+I"
          icon={<Italic className="h-3.5 w-3.5" />}
          onClick={run(() => chain().toggleItalic().run())}
        />
        <CmdItem
          label="Underline"
          shortcut="Ctrl+U"
          icon={<UnderlineIcon className="h-3.5 w-3.5" />}
          onClick={run(() => chain().toggleUnderline().run())}
        />
        <CmdItem
          label="Strikethrough"
          icon={<Strikethrough className="h-3.5 w-3.5" />}
          onClick={run(() => chain().toggleStrike().run())}
        />
        <CmdItem
          label="Highlight"
          icon={<Highlighter className="h-3.5 w-3.5" />}
          onClick={run(() => chain().toggleHighlight().run())}
        />
        <CmdSep />
        <CmdItem
          label="Subscript"
          icon={<Subscript className="h-3.5 w-3.5" />}
          onClick={run(() => chain().toggleSubscript().run())}
        />
        <CmdItem
          label="Superscript"
          icon={<Superscript className="h-3.5 w-3.5" />}
          onClick={run(() => chain().toggleSuperscript().run())}
        />
      </CmdSub>

      <CmdSub label="Align" icon={<AlignLeft className="h-3.5 w-3.5" />}>
        <CmdItem
          label="Align Left"
          icon={<AlignLeft className="h-3.5 w-3.5" />}
          onClick={run(() => chain().setTextAlign("left").run())}
        />
        <CmdItem
          label="Center"
          icon={<AlignCenter className="h-3.5 w-3.5" />}
          onClick={run(() => chain().setTextAlign("center").run())}
        />
        <CmdItem
          label="Align Right"
          icon={<AlignRight className="h-3.5 w-3.5" />}
          onClick={run(() => chain().setTextAlign("right").run())}
        />
        <CmdItem
          label="Justify"
          icon={<AlignJustify className="h-3.5 w-3.5" />}
          onClick={run(() => chain().setTextAlign("justify").run())}
        />
        <CmdSep />
        <CmdItem
          label="Increase Indent"
          shortcut="Tab"
          icon={<IndentIncrease className="h-3.5 w-3.5" />}
          onClick={run(() => chain().indent().run())}
        />
        <CmdItem
          label="Decrease Indent"
          shortcut="Shift+Tab"
          icon={<IndentDecrease className="h-3.5 w-3.5" />}
          onClick={run(() => chain().outdent().run())}
        />
      </CmdSub>

      <CmdSub label="Lists" icon={<List className="h-3.5 w-3.5" />}>
        <CmdItem
          label="Bulleted List"
          icon={<List className="h-3.5 w-3.5" />}
          onClick={run(() => chain().toggleBulletList().run())}
        />
        <CmdItem
          label="Numbered List"
          icon={<ListOrdered className="h-3.5 w-3.5" />}
          onClick={run(() => chain().toggleOrderedList().run())}
        />
        <CmdItem
          label="Checklist"
          icon={<ListTodo className="h-3.5 w-3.5" />}
          onClick={run(() => chain().toggleTaskList().run())}
        />
      </CmdSub>

      <CmdItem
        label="Font…"
        icon={<Type className="h-3.5 w-3.5" />}
        onClick={run(() => onOpenDialog("font"))}
      />
      <CmdItem
        label="Paragraph…"
        icon={<AlignJustify className="h-3.5 w-3.5" />}
        onClick={run(() => onOpenDialog("paragraph"))}
      />
      <CmdItem
        label="Clear Formatting"
        icon={<Eraser className="h-3.5 w-3.5" />}
        onClick={run(() => chain().unsetAllMarks().clearNodes().run())}
      />

      <CmdSep />

      {/* ---------------- link ---------------- */}
      <CmdItem
        label={inLink ? "Edit Link…" : "Insert Link…"}
        shortcut="Ctrl+K"
        icon={<LinkIcon className="h-3.5 w-3.5" />}
        onClick={run(() => onOpenDialog("link"))}
      />
      {inLink && (
        <CmdItem
          label="Remove Link"
          icon={<Unlink className="h-3.5 w-3.5" />}
          onClick={run(() => chain().unsetLink().run())}
        />
      )}

      {/* ---------------- picture ---------------- */}
      {inFigure && (
        <>
          <CmdSep />
          <CmdHeading>Picture</CmdHeading>
          <CmdSub label="Position" icon={<ImageIcon className="h-3.5 w-3.5" />}>
            {WRAPS.map((w) => (
              <CmdItem
                key={w.value}
                label={w.label}
                onClick={run(() => chain().updateFigure({ align: w.value }).run())}
              />
            ))}
          </CmdSub>
          <CmdSub label={`Width — ${figureWidth}%`}>
            {[25, 33, 50, 66, 75, 100].map((w) => (
              <CmdItem
                key={w}
                label={`${w}%`}
                onClick={run(() => chain().updateFigure({ width: w }).run())}
              />
            ))}
          </CmdSub>
          <CmdItem
            label="Replace Picture…"
            icon={<ImageIcon className="h-3.5 w-3.5" />}
            onClick={run(() => onOpenDialog("image"))}
          />
          <CmdItem
            label="Delete Picture"
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
          <CmdHeading>Table</CmdHeading>
          <CmdSub label="Rows" icon={<Rows3 className="h-3.5 w-3.5" />}>
            <CmdItem
              label="Insert Row Above"
              icon={<ArrowUp className="h-3.5 w-3.5" />}
              onClick={run(() => chain().addRowBefore().run())}
            />
            <CmdItem
              label="Insert Row Below"
              icon={<ArrowDown className="h-3.5 w-3.5" />}
              onClick={run(() => chain().addRowAfter().run())}
            />
            <CmdItem
              label="Delete Row"
              danger
              icon={<Trash2 className="h-3.5 w-3.5" />}
              onClick={run(() => chain().deleteRow().run())}
            />
          </CmdSub>
          <CmdSub label="Columns" icon={<Columns3 className="h-3.5 w-3.5" />}>
            <CmdItem
              label="Insert Column Left"
              onClick={run(() => chain().addColumnBefore().run())}
            />
            <CmdItem
              label="Insert Column Right"
              onClick={run(() => chain().addColumnAfter().run())}
            />
            <CmdItem
              label="Delete Column"
              danger
              icon={<Trash2 className="h-3.5 w-3.5" />}
              onClick={run(() => chain().deleteColumn().run())}
            />
          </CmdSub>
          <CmdItem
            label="Merge Cells"
            icon={<Combine className="h-3.5 w-3.5" />}
            onClick={run(() => chain().mergeCells().run())}
          />
          <CmdItem
            label="Split Cell"
            icon={<Split className="h-3.5 w-3.5" />}
            onClick={run(() => chain().splitCell().run())}
          />
          <CmdItem
            label="Move Table Up"
            icon={<ArrowUp className="h-3.5 w-3.5" />}
            onClick={run(() => moveTableBy(editor, -1))}
          />
          <CmdItem
            label="Move Table Down"
            icon={<ArrowDown className="h-3.5 w-3.5" />}
            onClick={run(() => moveTableBy(editor, 1))}
          />
          <CmdItem
            label="Delete Table"
            danger
            icon={<Trash2 className="h-3.5 w-3.5" />}
            onClick={run(() => chain().deleteTable().run())}
          />
        </>
      ) : (
        <CmdItem
          label="Insert Table…"
          icon={<TableIcon className="h-3.5 w-3.5" />}
          onClick={run(() => onOpenDialog("table"))}
        />
      )}

      <CmdSep />

      {canReadAloud && (
        <CmdItem
          label="Read Aloud"
          icon={<Volume2 className="h-3.5 w-3.5" />}
          onClick={run(onReadAloud)}
        />
      )}
      <CmdItem
        label="Find & Replace…"
        shortcut="Ctrl+F"
        icon={<Search className="h-3.5 w-3.5" />}
        onClick={run(onOpenFind)}
      />
    </ContextMenu>
  );
}
