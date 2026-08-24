"use client";

import type { Editor } from "@tiptap/react";
import {
  AlignHorizontalSpaceAround,
  Columns2,
  Columns3,
  IndentDecrease,
  IndentIncrease,
  Image as ImageIcon,
  Minus,
  Square,
} from "lucide-react";
import { BigBtn, Btn, Group, IconCombo, MenuHeading, MenuItem, Row, Stack } from "./ui";
import type { FigureAlign } from "./figure";
import { useAdminText } from "@/lib/admin-strings";

const WRAPS: { value: FigureAlign; label: string }[] = [
  { value: "center", label: "মাঝে, নিজের লাইনে" },
  { value: "left", label: "বামে" },
  { value: "right", label: "ডানে" },
  { value: "wrap-left", label: "বামে, চারপাশে লেখা" },
  { value: "wrap-right", label: "ডানে, চারপাশে লেখা" },
];

const WIDTHS = [25, 33, 50, 66, 75, 100];

/**
 * Word's Layout tab, trimmed to what changes a web page.
 *
 * Margins, orientation and paper size are left out on purpose: the article is
 * published as HTML, so those would move things in the editor and nothing on
 * the site. Columns, hyphenation, indent, spacing and picture wrap all reach
 * the reader.
 */
export function LayoutTab({ editor }: { editor: Editor }) {
  const ax = useAdminText();
  const inFigure = editor.isActive("figure");
  const figureWidth = (editor.getAttributes("figure").width as number) ?? 100;

  return (
    <div className="flex h-[92px] items-stretch overflow-x-auto bg-white">
      {/* ---------------- Columns ---------------- */}
      <Group label="Columns">
        <BigBtn
          title={ax("এক কলাম — স্বাভাবিক")}
          label="One"
          active={!editor.isActive("columnBlock")}
          icon={<Square className="h-5 w-5" />}
          onClick={() => editor.chain().focus().setColumnCount(1).run()}
        />
        <BigBtn
          title={ax("বাছাই করা লেখাটি দুই কলামে সাজান")}
          label="Two"
          active={editor.isActive("columnBlock", { count: 2 })}
          icon={<Columns2 className="h-5 w-5" />}
          onClick={() => editor.chain().focus().setColumnCount(2).run()}
        />
        <BigBtn
          title={ax("বাছাই করা লেখাটি তিন কলামে সাজান")}
          label="Three"
          active={editor.isActive("columnBlock", { count: 3 })}
          icon={<Columns3 className="h-5 w-5" />}
          onClick={() => editor.chain().focus().setColumnCount(3).run()}
        />
      </Group>

      {/* ---------------- Paragraph ---------------- */}
      <Group label="Paragraph">
        <Stack>
          <Row>
            <Btn
              title={ax("ইনডেন্ট কমান")}
              onClick={() => editor.chain().focus().outdent().run()}
            >
              <IndentDecrease className="h-3.5 w-3.5" />
            </Btn>
            <Btn
              title={ax("ইনডেন্ট বাড়ান")}
              onClick={() => editor.chain().focus().indent().run()}
            >
              <IndentIncrease className="h-3.5 w-3.5" />
            </Btn>
            <IconCombo
              title={ax("প্যারার পরে ফাঁকা")}
              icon={<AlignHorizontalSpaceAround className="h-3.5 w-3.5" />}
              panelWidth={168}
            >
              {(close) => (
                <>
                  <MenuHeading>{ax("প্যারার পরে ফাঁকা")}</MenuHeading>
                  {["0", "0.5em", "1em", "1.5em", "2em", "3em"].map((s) => (
                    <MenuItem
                      key={s}
                      onClick={() => {
                        editor.chain().focus().setParagraphSpacing(s).run();
                        close();
                      }}
                    >
                      {s === "0" ? "নেই" : s}
                    </MenuItem>
                  ))}
                </>
              )}
            </IconCombo>
          </Row>
          <Row>
            <Btn
              title={ax("হাইফেনেশন — লাইনের শেষে শব্দ ভাঙা")}
              active={editor.isActive("paragraph", { hyphens: true })}
              onClick={() => editor.chain().focus().toggleHyphenation().run()}
            >
              <Minus className="h-3.5 w-3.5" />
            </Btn>
          </Row>
        </Stack>
      </Group>

      {/* ---------------- Arrange (pictures) ---------------- */}
      <Group label="Arrange">
        <IconCombo
          title={
            inFigure
              ? ax("ছবির অবস্থান ও চারপাশে লেখা")
              : ax("আগে একটি ছবি সিলেক্ট করুন")
          }
          panelWidth={220}
          icon={
            <span
              className={`flex h-[46px] w-[46px] flex-col items-center justify-center gap-0.5 ${
                inFigure ? "" : "opacity-40"
              }`}
            >
              <ImageIcon className="h-5 w-5" />
              <span className="font-ui text-[10px] leading-none">Wrap</span>
            </span>
          }
        >
          {(close) =>
            !inFigure ? (
              <p className="px-3 py-3 font-ui text-[11px] leading-snug text-[#666]">
                {ax("ছবির অবস্থান বদলাতে আগে খবরের ভেতরের একটি ছবিতে ক্লিক করুন।")}
              </p>
            ) : (
              <>
                <MenuHeading>{ax("ছবির অবস্থান")}</MenuHeading>
                {WRAPS.map((w) => (
                  <MenuItem
                    key={w.value}
                    active={editor.isActive("figure", { align: w.value })}
                    onClick={() => {
                      editor.chain().focus().updateFigure({ align: w.value }).run();
                      close();
                    }}
                  >
                    {w.label}
                  </MenuItem>
                ))}
                <MenuHeading>{ax("চওড়া")}</MenuHeading>
                {WIDTHS.map((w) => (
                  <MenuItem
                    key={w}
                    active={figureWidth === w}
                    onClick={() => {
                      editor.chain().focus().updateFigure({ width: w }).run();
                      close();
                    }}
                  >
                    {w}%
                  </MenuItem>
                ))}
              </>
            )
          }
        </IconCombo>
      </Group>
    </div>
  );
}
