"use client";

import type { Editor } from "@tiptap/react";
import {
  ArrowDown,
  ArrowUp,
  Columns3,
  Combine,
  Rows3,
  Split,
  Table as TableIcon,
  Trash2,
} from "lucide-react";
import { BigBtn, Group, LabelBtn, Stack } from "./ui";
import { findTable } from "./table-tools";

/**
 * Word's contextual Table tab — it appears only while the cursor is inside a
 * table, which is what makes these commands findable at all. Buried on the
 * Insert tab, "delete table" looked broken simply because the buttons were
 * greyed out whenever you were not standing in one.
 */
export function TableTab({ editor }: { editor: Editor }) {
  /**
   * `deleteTable()` walks up from the cursor. If the table is selected as a
   * whole node instead, that walk finds nothing and the command quietly
   * returns false — which is what made "delete table" look broken. Fall back
   * to removing the node outright.
   */
  const removeTable = () => {
    if (editor.chain().focus().deleteTable().run()) return;
    const found = findTable(editor);
    if (!found) return;
    editor
      .chain()
      .focus()
      .deleteRange({ from: found.pos, to: found.pos + found.node.nodeSize })
      .run();
  };

  return (
    <div className="flex h-[92px] items-stretch overflow-x-auto bg-white">
      {/* ---------------- Rows ---------------- */}
      <Group label="Rows">
        <Stack>
          <LabelBtn
            title="উপরে একটি সারি যোগ করুন"
            label="উপরে সারি"
            icon={<ArrowUp className="h-3.5 w-3.5" />}
            onClick={() => editor.chain().focus().addRowBefore().run()}
          />
          <LabelBtn
            title="নিচে একটি সারি যোগ করুন"
            label="নিচে সারি"
            icon={<ArrowDown className="h-3.5 w-3.5" />}
            onClick={() => editor.chain().focus().addRowAfter().run()}
          />
          <LabelBtn
            title="এই সারিটি মুছুন"
            label="সারি মুছুন"
            icon={<Rows3 className="h-3.5 w-3.5" />}
            onClick={() => editor.chain().focus().deleteRow().run()}
          />
        </Stack>
      </Group>

      {/* ---------------- Columns ---------------- */}
      <Group label="Columns">
        <Stack>
          <LabelBtn
            title="বামে একটি কলাম যোগ করুন"
            label="বামে কলাম"
            icon={<Columns3 className="h-3.5 w-3.5" />}
            onClick={() => editor.chain().focus().addColumnBefore().run()}
          />
          <LabelBtn
            title="ডানে একটি কলাম যোগ করুন"
            label="ডানে কলাম"
            icon={<Columns3 className="h-3.5 w-3.5 rotate-180" />}
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          />
          <LabelBtn
            title="এই কলামটি মুছুন"
            label="কলাম মুছুন"
            icon={<Columns3 className="h-3.5 w-3.5" />}
            onClick={() => editor.chain().focus().deleteColumn().run()}
          />
        </Stack>
      </Group>

      {/* ---------------- Merge ---------------- */}
      <Group label="Merge">
        <BigBtn
          title="নির্বাচিত ঘরগুলো এক করুন"
          label="জোড়া দিন"
          icon={<Combine className="h-5 w-5" />}
          onClick={() => editor.chain().focus().mergeCells().run()}
        />
        <BigBtn
          title="জোড়া ঘরটি আবার আলাদা করুন"
          label="আলাদা করুন"
          icon={<Split className="h-5 w-5" />}
          onClick={() => editor.chain().focus().splitCell().run()}
        />
      </Group>

      {/* ---------------- Header ---------------- */}
      <Group label="Header">
        <Stack>
          <LabelBtn
            title="প্রথম সারিটি হেডার করুন / সরান"
            label="হেডার সারি"
            icon={<span className="text-[10px] font-bold">TH</span>}
            onClick={() => editor.chain().focus().toggleHeaderRow().run()}
          />
          <LabelBtn
            title="প্রথম কলামটি হেডার করুন / সরান"
            label="হেডার কলাম"
            icon={<span className="text-[10px] font-bold">TC</span>}
            onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
          />
        </Stack>
      </Group>

      {/* ---------------- Table ---------------- */}
      <Group label="Table">
        <BigBtn
          title="পুরো টেবিলটি মুছে ফেলুন"
          label="টেবিল মুছুন"
          icon={<Trash2 className="h-5 w-5" />}
          onClick={removeTable}
        />
        <BigBtn
          title="পুরো টেবিলটি সিলেক্ট করুন"
          label="সিলেক্ট"
          icon={<TableIcon className="h-5 w-5" />}
          onClick={() => {
            const found = findTable(editor);
            if (found) editor.chain().focus().setNodeSelection(found.pos).run();
          }}
        />
      </Group>

      <div className="flex items-center px-4">
        <p className="max-w-[250px] font-ui text-[10px] leading-snug text-[#666]">
          টেবিলের উপরে-বাঁয়ের ⊞ ধরে টানলে টেবিলটি অন্য জায়গায় যাবে,
          নিচে-ডানের কোণা ধরে টানলে আকার বদলাবে, আর দুই কলামের মাঝের দাগ
          টানলে কলামের চওড়া বদলাবে।
        </p>
      </div>
    </div>
  );
}
