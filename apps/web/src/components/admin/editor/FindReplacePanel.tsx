"use client";

import { useEffect, useRef, useState } from "react";
import type { Editor } from "@tiptap/react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { keepFocus } from "./ui";

export function FindReplacePanel({
  editor,
  onClose,
}: {
  editor: Editor;
  onClose: () => void;
}) {
  const [term, setTerm] = useState("");
  const [replacement, setReplacement] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  // Bumped after every command so the "3 / 12" counter re-reads editor storage.
  const [, force] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Re-run the search whenever the term or the options change.
  useEffect(() => {
    editor.commands.setSearch(term, { caseSensitive, wholeWord });
    force((n) => n + 1);
  }, [editor, term, caseSensitive, wholeWord]);

  // Clear the highlights when the panel goes away.
  useEffect(() => {
    return () => {
      editor.commands.clearSearch();
    };
  }, [editor]);

  const storage = editor.storage.findReplace;
  const total = storage?.matches.length ?? 0;
  const current = total ? storage.current + 1 : 0;

  const run = (fn: () => void) => {
    fn();
    force((n) => n + 1);
  };

  return (
    <div
      onMouseDown={keepFocus}
      className="flex flex-wrap items-center gap-2 border-b border-[#d4d4d4] bg-[#f3f2f1] px-3 py-2"
    >
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              run(() =>
                e.shiftKey
                  ? editor.commands.findPrevious()
                  : editor.commands.findNext(),
              );
            }
            if (e.key === "Escape") onClose();
          }}
          placeholder="যা খুঁজবেন…"
          className="h-8 w-48 rounded border border-[#d4d4d4] bg-white px-2 font-ui text-xs text-[#333] outline-none focus:border-[#d81f26]"
        />
        <span className="w-14 shrink-0 text-center font-ui text-[11px] text-[#666]">
          {total ? `${current} / ${total}` : term ? "০টি" : ""}
        </span>
        <button
          type="button"
          title="আগেরটি (Shift+Enter)"
          disabled={!total}
          onMouseDown={keepFocus}
          onClick={() => run(() => editor.commands.findPrevious())}
          className="flex h-8 w-8 items-center justify-center rounded border border-[#d4d4d4] text-[#333] hover:bg-white disabled:opacity-30"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="পরেরটি (Enter)"
          disabled={!total}
          onMouseDown={keepFocus}
          onClick={() => run(() => editor.commands.findNext())}
          className="flex h-8 w-8 items-center justify-center rounded border border-[#d4d4d4] text-[#333] hover:bg-white disabled:opacity-30"
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <input
          value={replacement}
          onChange={(e) => setReplacement(e.target.value)}
          placeholder="যা বসাবেন…"
          className="h-8 w-48 rounded border border-[#d4d4d4] bg-white px-2 font-ui text-xs text-[#333] outline-none focus:border-[#d81f26]"
        />
        <button
          type="button"
          disabled={!total}
          onMouseDown={keepFocus}
          onClick={() => run(() => editor.commands.replaceCurrent(replacement))}
          className="h-8 rounded border border-[#d4d4d4] px-2 font-ui text-[11px] text-[#333] hover:bg-white disabled:opacity-30"
        >
          বদলান
        </button>
        <button
          type="button"
          disabled={!total}
          onMouseDown={keepFocus}
          onClick={() => run(() => editor.commands.replaceAll(replacement))}
          className="h-8 rounded bg-[#14181f] px-2 font-ui text-[11px] font-semibold text-white hover:bg-[#2a3240] disabled:opacity-30"
        >
          সব বদলান
        </button>
      </div>

      <label className="flex cursor-pointer items-center gap-1 font-ui text-[11px] text-[#666]">
        <input
          type="checkbox"
          checked={caseSensitive}
          onChange={(e) => setCaseSensitive(e.target.checked)}
          className="accent-[#d81f26]"
        />
        ছোট/বড় হাতের মিল
      </label>
      <label className="flex cursor-pointer items-center gap-1 font-ui text-[11px] text-[#666]">
        <input
          type="checkbox"
          checked={wholeWord}
          onChange={(e) => setWholeWord(e.target.checked)}
          className="accent-[#d81f26]"
        />
        পুরো শব্দ
      </label>

      <button
        type="button"
        title="বন্ধ করুন (Esc)"
        onMouseDown={keepFocus}
        onClick={onClose}
        className="ml-auto flex h-8 w-8 items-center justify-center rounded text-[#666] hover:bg-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
