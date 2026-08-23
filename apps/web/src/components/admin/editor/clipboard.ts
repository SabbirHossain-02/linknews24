"use client";

import type { Editor } from "@tiptap/react";

/**
 * Clipboard commands that survive an insecure origin.
 *
 * The async Clipboard API (`navigator.clipboard`) only exists in a secure
 * context. This admin currently runs on plain http://IP:port, so that object is
 * simply undefined and every ribbon clipboard button failed.
 *
 * Copy and cut have a working fallback — `document.execCommand`, deprecated but
 * supported everywhere and allowed on http. Programmatic *paste* has no
 * fallback: every browser blocks a page from reading the clipboard without the
 * secure-context permission, by design. So the paste button says what to press
 * instead of pretending, and the fix is HTTPS.
 */

export type ClipboardResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

function hasAsyncClipboard(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.clipboard?.write === "function" &&
    window.isSecureContext
  );
}

export function canReadClipboard(): boolean {
  return (
    typeof navigator !== "undefined" &&
    typeof navigator.clipboard?.read === "function" &&
    window.isSecureContext
  );
}

/** Serialises the current selection to HTML using ProseMirror's own serializer. */
function selectionHTML(editor: Editor): string {
  const { from, to } = editor.state.selection;
  const slice = editor.state.doc.slice(from, to);
  const div = document.createElement("div");
  div.appendChild(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (editor.view as any)
      .someProp("clipboardSerializer")
      ?.serializeFragment(slice.content) ??
      document.createTextNode(editor.state.doc.textBetween(from, to, "\n")),
  );
  return div.innerHTML;
}

export async function copySelection(
  editor: Editor,
  cut: boolean,
): Promise<ClipboardResult> {
  const { from, to } = editor.state.selection;
  if (from === to) return { ok: false, message: "আগে লেখা সিলেক্ট করুন" };

  const text = editor.state.doc.textBetween(from, to, "\n");

  if (hasAsyncClipboard()) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([selectionHTML(editor)], { type: "text/html" }),
          "text/plain": new Blob([text], { type: "text/plain" }),
        }),
      ]);
      if (cut) editor.chain().focus().deleteSelection().run();
      return { ok: true, message: cut ? "কাট হয়েছে" : "কপি হয়েছে" };
    } catch {
      // Fall through to execCommand.
    }
  }

  // execCommand acts on the document's live selection, so put it back first.
  editor.commands.focus();
  try {
    const done = document.execCommand(cut ? "cut" : "copy");
    if (done) return { ok: true, message: cut ? "কাট হয়েছে" : "কপি হয়েছে" };
  } catch {
    // Reported below.
  }

  return {
    ok: false,
    message: `কপি করা গেল না — Ctrl+${cut ? "X" : "C"} চাপুন`,
  };
}

export async function pasteIntoEditor(
  editor: Editor,
  plainText: boolean,
): Promise<ClipboardResult> {
  if (!canReadClipboard()) {
    editor.commands.focus();
    return {
      ok: false,
      message:
        "সাইটে HTTPS নেই বলে ব্রাউজার পেস্ট আটকে দিচ্ছে — Ctrl+V চাপুন",
    };
  }

  try {
    const items = await navigator.clipboard.read();
    for (const item of items) {
      if (!plainText && item.types.includes("text/html")) {
        const html = await (await item.getType("text/html")).text();
        editor.chain().focus().insertContent(html).run();
        return { ok: true, message: "পেস্ট হয়েছে" };
      }
    }
    const text = await navigator.clipboard.readText();
    editor.chain().focus().insertContent(text).run();
    return { ok: true, message: "পেস্ট হয়েছে" };
  } catch {
    editor.commands.focus();
    return { ok: false, message: "ব্রাউজার অনুমতি দেয়নি — Ctrl+V চাপুন" };
  }
}
