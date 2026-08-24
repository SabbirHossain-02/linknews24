"use client";

import type { Editor } from "@tiptap/react";
import { useAdminText } from "@/lib/admin-strings";

interface Heading {
  level: number;
  text: string;
  pos: number;
}

/**
 * Word's navigation pane: every heading in the document, click to jump.
 * Rebuilt on each render because the parent re-renders on every editor update.
 */
export function Outline({ editor }: { editor: Editor }) {
  const ax = useAdminText();
  const headings: Heading[] = [];
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name !== "heading") return;
    headings.push({
      level: (node.attrs.level as number) ?? 1,
      text: node.textContent || "(শিরোনামহীন)",
      pos,
    });
  });

  return (
    <aside className="w-56 shrink-0 overflow-y-auto border-r border-[#d4d4d4] bg-[#f3f2f1] p-3">
      <p className="mb-2 font-ui text-[11px] font-bold uppercase tracking-wide text-[#666]">
        {ax("আউটলাইন")}
      </p>
      {headings.length === 0 ? (
        <p className="font-ui text-[11px] leading-relaxed text-[#666]">
          {ax("কোনো শিরোনাম নেই। স্টাইল গ্যালারি থেকে শিরোনাম দিলে এখানে দেখা যাবে।")}
        </p>
      ) : (
        <ul className="flex flex-col gap-0.5">
          {headings.map((heading, i) => (
            <li key={`${heading.pos}-${i}`}>
              <button
                type="button"
                onClick={() => {
                  editor
                    .chain()
                    .focus()
                    .setTextSelection(heading.pos + 1)
                    .scrollIntoView()
                    .run();
                }}
                style={{ paddingLeft: `${(heading.level - 1) * 10}px` }}
                className="block w-full truncate rounded py-1 pr-1 text-left font-ui text-[11px] text-[#333] hover:bg-white hover:text-[#d81f26]"
                title={heading.text}
              >
                {heading.text}
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
