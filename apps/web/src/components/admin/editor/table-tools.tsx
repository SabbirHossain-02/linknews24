"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Editor } from "@tiptap/react";
import type { Node as PMNode } from "@tiptap/pm/model";
import { NodeSelection, TextSelection } from "@tiptap/pm/state";
import { useAdminText } from "@/lib/admin-strings";

/** The table the cursor is standing in, if any. */
export function findTable(
  editor: Editor,
): { pos: number; node: PMNode } | null {
  const { selection } = editor.state;
  if (selection instanceof NodeSelection && selection.node.type.name === "table")
    return { pos: selection.from, node: selection.node };

  const $from = selection.$from;
  for (let d = $from.depth; d > 0; d -= 1) {
    const node = $from.node(d);
    if (node.type.name === "table") return { pos: $from.before(d), node };
  }
  return null;
}

/** The <table> element for a table at `pos` (the node view wraps it in a div). */
function tableDom(editor: Editor, pos: number): HTMLTableElement | null {
  const dom = editor.view.nodeDOM(pos);
  if (!(dom instanceof HTMLElement)) return null;
  return dom instanceof HTMLTableElement
    ? dom
    : dom.querySelector("table");
}

/**
 * Swaps the table with the block above or below it.
 *
 * Dragging is fine in a long story, but in a page that holds little besides the
 * table there is barely anywhere to drop it, so the grip felt dead. These two
 * commands always do something you can see.
 */
export function moveTableBy(editor: Editor, dir: -1 | 1): boolean {
  const found = findTable(editor);
  if (!found) return false;

  const { state, view } = editor;
  const { pos, node } = found;
  const $pos = state.doc.resolve(pos);
  // Only tables sitting directly in the document can trade places.
  if ($pos.depth !== 0) return false;

  const index = $pos.index();
  const sibling = state.doc.maybeChild(dir < 0 ? index - 1 : index + 1);
  if (!sibling) return false;

  const from = pos;
  const to = pos + node.nodeSize;
  const target = dir < 0 ? pos - sibling.nodeSize : to + sibling.nodeSize;

  const tr = state.tr;
  tr.delete(from, to);
  const at = tr.mapping.map(target);
  tr.insert(at, node);
  tr.setSelection(TextSelection.near(tr.doc.resolve(at + 1)));
  view.dispatch(tr.scrollIntoView());
  editor.commands.focus();
  return true;
}

/**
 * Where a table dropped at this pointer position would land: after the last
 * top-level block whose middle is above the pointer. `y` is where to draw the
 * insertion line.
 */
function dropTarget(
  editor: Editor,
  y: number,
): { pos: number; y: number } | null {
  const { state, view } = editor;
  let target = 0;
  let line: number | null = null;

  state.doc.forEach((child, offset) => {
    const dom = view.nodeDOM(offset);
    if (!(dom instanceof HTMLElement)) return;
    const r = dom.getBoundingClientRect();
    if (line === null) line = r.top;
    if (y > (r.top + r.bottom) / 2) {
      target = offset + child.nodeSize;
      line = r.bottom;
    }
  });

  return line === null ? null : { pos: target, y: line };
}

/**
 * Write column widths onto every cell, the way prosemirror-tables' own column
 * resizer does. With a width on each column the table view switches to a fixed
 * pixel width, which is what makes the whole table grow and shrink.
 */
function applyColWidths(
  editor: Editor,
  tablePos: number,
  widths: number[],
  addToHistory: boolean,
) {
  const { state, view } = editor;
  const table = state.doc.nodeAt(tablePos);
  if (!table) return;

  const tr = state.tr;
  table.forEach((row, rowOffset) => {
    let col = 0;
    row.forEach((cell, cellOffset) => {
      const span: number = cell.attrs.colspan || 1;
      const cellPos = tablePos + 1 + rowOffset + 1 + cellOffset;
      tr.setNodeMarkup(cellPos, undefined, {
        ...cell.attrs,
        colwidth: widths.slice(col, col + span),
      });
      col += span;
    });
  });

  if (!addToHistory) tr.setMeta("addToHistory", false);
  if (tr.docChanged) view.dispatch(tr);
}

/** Current column widths read off the rendered table, in order. */
function currentWidths(table: HTMLTableElement): number[] {
  const row = table.rows[0];
  if (!row) return [];
  const widths: number[] = [];
  for (const cell of Array.from(row.cells)) {
    const span = cell.colSpan || 1;
    const each = cell.getBoundingClientRect().width / span;
    for (let i = 0; i < span; i += 1) widths.push(each);
  }
  return widths;
}

const MIN_COL = 30;

/**
 * Word's table handles: the ⊞ grip at the top-left moves the whole table, the
 * ◢ grip at the bottom-right resizes it. Both are drawn over the page rather
 * than inside the document, so they never end up in the saved HTML.
 *
 * Dragging a column border still resizes a single column — that comes from
 * prosemirror-tables and is left alone.
 */
export function TableHandles({ editor }: { editor: Editor }) {
  const ax = useAdminText();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [dropY, setDropY] = useState<number | null>(null);
  const posRef = useRef<number>(-1);

  /** Re-measure the active table. Runs on every transaction, scroll and resize. */
  const measure = useCallback(() => {
    const found = findTable(editor);
    if (!found) {
      posRef.current = -1;
      setRect(null);
      return;
    }
    posRef.current = found.pos;
    const el = tableDom(editor, found.pos);
    setRect(el ? el.getBoundingClientRect() : null);
  }, [editor]);

  useEffect(() => {
    measure();
    editor.on("transaction", measure);
    editor.on("selectionUpdate", measure);
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      editor.off("transaction", measure);
      editor.off("selectionUpdate", measure);
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [editor, measure]);

  // ---------------- move ----------------
  const startMove = (e: React.MouseEvent) => {
    e.preventDefault();
    const found = findTable(editor);
    if (!found) return;
    const { pos, node } = found;
    const from = pos;
    const to = pos + node.nodeSize;

    const { view } = editor;
    view.dispatch(
      view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos)),
    );

    let target: number | null = null;

    const onMove = (ev: MouseEvent) => {
      const t = dropTarget(editor, ev.clientY);
      // Inside itself, or right where it already is, would move nothing — so
      // don't draw a line promising a move that will not happen.
      const noop = !t || (t.pos >= from && t.pos <= to);
      if (noop) {
        target = null;
        setDropY(null);
        return;
      }
      target = t!.pos;
      setDropY(t!.y);
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      setDropY(null);
      if (target === null) return;

      const tr = editor.view.state.tr;
      tr.delete(from, to);
      const at = tr.mapping.map(target);
      tr.insert(at, node);
      tr.setSelection(TextSelection.near(tr.doc.resolve(at + 1)));
      editor.view.dispatch(tr.scrollIntoView());
      editor.commands.focus();
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  // ---------------- resize ----------------
  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const pos = posRef.current;
    const el = pos >= 0 ? tableDom(editor, pos) : null;
    if (!el) return;

    const base = currentWidths(el);
    if (!base.length) return;
    const startX = e.clientX;
    const startW = base.reduce((a, b) => a + b, 0);
    // Never let the table grow past the page it is sitting on.
    const maxW = (el.parentElement?.clientWidth ?? startW) || startW;
    const minW = base.length * MIN_COL;
    let last = base;

    const scaleTo = (width: number) => {
      const factor = width / startW;
      return base.map((w) => Math.max(MIN_COL, Math.round(w * factor)));
    };

    const onMove = (ev: MouseEvent) => {
      const width = Math.min(
        Math.max(startW + (ev.clientX - startX), minW),
        maxW,
      );
      last = scaleTo(width);
      applyColWidths(editor, pos, last, false);
      measure();
    };

    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      // One undoable step for the whole drag, as Word does.
      applyColWidths(editor, pos, last, true);
      editor.commands.focus();
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  if (typeof document === "undefined" || !rect) return null;

  return createPortal(
    <>
      <button
        type="button"
        title={ax("টেবিলটি ধরে অন্য জায়গায় নিন")}
        onMouseDown={startMove}
        style={{ top: rect.top - 11, left: rect.left - 11 }}
        className="fixed z-[60] flex h-[18px] w-[18px] cursor-move items-center justify-center rounded-sm border border-[#8a8886] bg-white text-[#333] shadow-sm hover:border-[#d81f26] hover:text-[#d81f26]"
      >
        <span className="grid grid-cols-2 gap-[1px]">
          <i className="block h-[3px] w-[3px] bg-current" />
          <i className="block h-[3px] w-[3px] bg-current" />
          <i className="block h-[3px] w-[3px] bg-current" />
          <i className="block h-[3px] w-[3px] bg-current" />
        </span>
      </button>

      <button
        type="button"
        title={ax("টেবিলের আকার বদলাতে টানুন")}
        onMouseDown={startResize}
        style={{ top: rect.bottom - 5, left: rect.right - 5 }}
        className="fixed z-[60] h-[11px] w-[11px] cursor-nwse-resize rounded-[2px] border border-[#8a8886] bg-white hover:border-[#d81f26] hover:bg-[#fbe3e4]"
      />

      {dropY !== null && (
        <div
          style={{ top: dropY - 1, left: rect.left, width: rect.width }}
          className="pointer-events-none fixed z-[60] h-[2px] bg-[#d81f26]"
        />
      )}
    </>,
    document.body,
  );
}
