"use client";

import type { Editor } from "@tiptap/react";
import {
  Bookmark,
  Columns3,
  Image as ImageIcon,
  Link as LinkIcon,
  Minus,
  Rows3,
  Sigma,
  Smile,
  SquareSplitHorizontal,
  Table as TableIcon,
  TextQuote,
  Trash2,
  Type,
  MonitorPlay,
} from "lucide-react";
import {
  BigBtn,
  Btn,
  Group,
  IconCombo,
  LabelBtn,
  MenuItem,
  Row,
  Stack,
} from "./ui";
import { TableGrid } from "./TableGrid";
import { EmojiPicker, SymbolPicker } from "./SymbolPicker";
import type { InsertDialogKind } from "./InsertDialogs";

export function InsertTab({
  editor,
  openDialog,
}: {
  editor: Editor;
  openDialog: (kind: InsertDialogKind) => void;
}) {
  // Table editing commands only make sense with the cursor inside a table.
  const inTable = editor.isActive("table");

  return (
    <div className="relative flex h-[92px] items-stretch overflow-x-auto bg-white">
      {/* ---------------- Tables ---------------- */}
      <Group label="Table" launchTitle="টেবিল ডায়ালগ" onLaunch={() => openDialog("table")}>
        <IconCombo
          title="টেবিল যোগ করুন"
          panelWidth={196}
          icon={
            <span className="flex h-[46px] w-[46px] flex-col items-center justify-center gap-0.5">
              <TableIcon className="h-5 w-5" />
              <span className="font-ui text-[10px] leading-none">Table</span>
            </span>
          }
        >
          {(close) => (
            <>
              <TableGrid
                onPick={(rows, cols) => {
                  editor
                    .chain()
                    .focus()
                    .insertTable({ rows, cols, withHeaderRow: true })
                    .run();
                  close();
                }}
              />
              <div className="border-t border-[#e1dfdd]">
                <MenuItem
                  onClick={() => {
                    openDialog("table");
                    close();
                  }}
                >
                  টেবিল যোগ করুন…
                </MenuItem>
              </div>
            </>
          )}
        </IconCombo>

        <Stack>
          <Row>
            <Btn
              title="উপরে সারি যোগ"
              disabled={!inTable}
              onClick={() => editor.chain().focus().addRowBefore().run()}
            >
              <Rows3 className="h-3.5 w-3.5" />
            </Btn>
            <Btn
              title="নিচে সারি যোগ"
              disabled={!inTable}
              onClick={() => editor.chain().focus().addRowAfter().run()}
            >
              <Rows3 className="h-3.5 w-3.5 rotate-180" />
            </Btn>
            <Btn
              title="সারি মুছুন"
              disabled={!inTable}
              onClick={() => editor.chain().focus().deleteRow().run()}
            >
              <span className="text-[10px] font-bold leading-none">−R</span>
            </Btn>
            <Btn
              title="হেডার সারি চালু/বন্ধ"
              disabled={!inTable}
              onClick={() => editor.chain().focus().toggleHeaderRow().run()}
            >
              <span className="text-[10px] font-bold leading-none">TH</span>
            </Btn>
          </Row>
          <Row>
            <Btn
              title="বামে কলাম যোগ"
              disabled={!inTable}
              onClick={() => editor.chain().focus().addColumnBefore().run()}
            >
              <Columns3 className="h-3.5 w-3.5" />
            </Btn>
            <Btn
              title="ডানে কলাম যোগ"
              disabled={!inTable}
              onClick={() => editor.chain().focus().addColumnAfter().run()}
            >
              <Columns3 className="h-3.5 w-3.5 rotate-180" />
            </Btn>
            <Btn
              title="কলাম মুছুন"
              disabled={!inTable}
              onClick={() => editor.chain().focus().deleteColumn().run()}
            >
              <span className="text-[10px] font-bold leading-none">−C</span>
            </Btn>
            <Btn
              title="ঘর জোড়া / আলাদা করুন"
              disabled={!inTable}
              onClick={() => editor.chain().focus().mergeOrSplit().run()}
            >
              <SquareSplitHorizontal className="h-3.5 w-3.5" />
            </Btn>
            <Btn
              title="পুরো টেবিল মুছুন"
              disabled={!inTable}
              onClick={() => editor.chain().focus().deleteTable().run()}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Btn>
          </Row>
        </Stack>
      </Group>

      {/* ---------------- Illustrations ---------------- */}
      <Group label="Illustrations">
        <BigBtn
          title="ছবি — ক্যাপশন, কৃতিত্ব ও alt সহ"
          label="Picture"
          icon={<ImageIcon className="h-5 w-5" />}
          onClick={() => openDialog("image")}
        />
        <BigBtn
          title="YouTube ভিডিও বসান"
          label="Video"
          icon={<MonitorPlay className="h-5 w-5" />}
          onClick={() => openDialog("video")}
        />
      </Group>

      {/* ---------------- Links ---------------- */}
      <Group label="Links">
        <Stack>
          <LabelBtn
            title="লিংক (Ctrl+K)"
            label="Link"
            icon={<LinkIcon className="h-3.5 w-3.5" />}
            active={editor.isActive("link")}
            onClick={() => openDialog("link")}
          />
          <LabelBtn
            title="বুকমার্ক — খবরের ভেতরে লাফ দেওয়ার জায়গা"
            label="Bookmark"
            icon={<Bookmark className="h-3.5 w-3.5" />}
            onClick={() => openDialog("bookmark")}
          />
        </Stack>
      </Group>

      {/* ---------------- Text ---------------- */}
      <Group label="Text">
        <BigBtn
          title="ফ্যাক্ট বক্স — খবরের পাশে আলাদা বাক্স"
          label="Text Box"
          icon={<TextQuote className="h-5 w-5" />}
          active={editor.isActive("callout")}
          onClick={() => editor.chain().focus().toggleCallout().run()}
        />
        <BigBtn
          title="ড্রপ ক্যাপ — অনুচ্ছেদের প্রথম অক্ষর বড়"
          label="Drop Cap"
          icon={<Type className="h-5 w-5" />}
          active={editor.isActive("paragraph", { dropcap: true })}
          onClick={() => editor.chain().focus().toggleDropCap().run()}
        />
        <Btn
          title="বিভাজক রেখা"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="h-3.5 w-3.5" />
        </Btn>
      </Group>

      {/* ---------------- Symbols ---------------- */}
      <Group label="Symbols">
        <IconCombo
          title="সিম্বল — ৳ ° ½ ইত্যাদি"
          panelWidth={260}
          icon={
            <span className="flex h-[46px] w-[46px] flex-col items-center justify-center gap-0.5">
              <span className="text-[17px] leading-none">Ω</span>
              <span className="font-ui text-[10px] leading-none">Symbol</span>
            </span>
          }
        >
          {(close) => (
            <SymbolPicker
              onPick={(char) => {
                editor.chain().focus().insertContent(char).run();
                close();
              }}
            />
          )}
        </IconCombo>

        <IconCombo
          title="ইমোজি"
          panelWidth={286}
          icon={
            <span className="flex h-[46px] w-[46px] flex-col items-center justify-center gap-0.5">
              <Smile className="h-5 w-5" />
              <span className="font-ui text-[10px] leading-none">Emoji</span>
            </span>
          }
        >
          {(close) => (
            <EmojiPicker
              onPick={(char) => {
                editor.chain().focus().insertContent(char).run();
                close();
              }}
            />
          )}
        </IconCombo>

        <BigBtn
          title="ইকুয়েশন (LaTeX)"
          label="Equation"
          icon={<Sigma className="h-5 w-5" />}
          onClick={() => openDialog("equation")}
        />
      </Group>
    </div>
  );
}
