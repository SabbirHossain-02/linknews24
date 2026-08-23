"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import type { Mark } from "@tiptap/pm/model";

interface CopiedFormat {
  marks: { type: string; attrs: Record<string, unknown> }[];
  block: { type: string; attrs: Record<string, unknown> } | null;
}

/**
 * Word's format painter.
 *
 * Click once to copy the formatting under the cursor, then select text to
 * paint it on; the brush stays armed until it is used (or clicked again to
 * disarm), matching Word's single-use behaviour.
 */
export function useFormatPainter(editor: Editor | null) {
  const [armed, setArmed] = useState(false);
  const copied = useRef<CopiedFormat | null>(null);

  const copyFormat = useCallback(() => {
    if (!editor) return;

    if (armed) {
      setArmed(false);
      copied.current = null;
      return;
    }

    const { $from, empty, from } = editor.state.selection;
    // With a collapsed cursor take the marks at the cursor; with a real
    // selection take the marks of its first character.
    const marks: readonly Mark[] = empty
      ? $from.marks()
      : editor.state.doc.resolve(from + 1).marks();

    copied.current = {
      marks: marks.map((mark) => ({
        type: mark.type.name,
        attrs: { ...mark.attrs },
      })),
      block: {
        type: $from.parent.type.name,
        attrs: { ...$from.parent.attrs },
      },
    };
    setArmed(true);
  }, [editor, armed]);

  /** Applies the copied formatting to the current selection. */
  const paint = useCallback(() => {
    if (!editor || !copied.current) return false;
    const { marks, block } = copied.current;
    if (editor.state.selection.empty) return false;

    const chain = editor.chain().focus().unsetAllMarks();

    if (block) {
      if (block.type === "heading" && typeof block.attrs.level === "number") {
        chain.setNode("heading", { level: block.attrs.level });
      } else if (block.type === "paragraph") {
        chain.setNode("paragraph");
      }
      // Carry the Word-style paragraph attributes across too.
      const { indent, spacing, dir, textAlign, lineHeight } = block.attrs;
      chain.updateAttributes(block.type, {
        indent: indent ?? 0,
        spacing: spacing ?? null,
        dir: dir ?? null,
        textAlign: textAlign ?? null,
        lineHeight: lineHeight ?? null,
      });
    }

    marks.forEach((mark) => chain.setMark(mark.type, mark.attrs));
    chain.run();

    copied.current = null;
    setArmed(false);
    return true;
  }, [editor]);

  /**
   * Fire the brush as soon as the user finishes selecting.
   *
   * The listener has to sit on the document, not on the ribbon: the selection
   * is made inside the editor, so that is where the mouse is released. Watching
   * the ribbon meant the brush armed and then never applied.
   */
  useEffect(() => {
    if (!armed || !editor) return;

    const tryPaint = () => {
      // Let ProseMirror commit the new selection before reading it.
      requestAnimationFrame(() => {
        if (!copied.current) return;
        if (editor.state.selection.empty) return;
        paint();
      });
    };

    document.addEventListener("mouseup", tryPaint);
    document.addEventListener("keyup", tryPaint);
    return () => {
      document.removeEventListener("mouseup", tryPaint);
      document.removeEventListener("keyup", tryPaint);
    };
  }, [armed, editor, paint]);

  return { armed, copyFormat };
}
