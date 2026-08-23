"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import Image from "next/image";
import { ChevronUp } from "lucide-react";
// KaTeX ships its own stylesheet; without it equations render as raw markup.
import "katex/dist/katex.min.css";
import { buildExtensions, editorProps } from "./editor/extensions";
import { FindReplace } from "./editor/find-replace";
import { FindReplacePanel } from "./editor/FindReplacePanel";
import { HomeTab } from "./editor/HomeTab";
import { LayoutTab } from "./editor/LayoutTab";
import { ReviewTab, type ReviewDialogKind } from "./editor/ReviewTab";
import {
  AccessibilityDialog,
  WordCountDialog,
} from "./editor/ReviewDialogs";
import { InsertTab } from "./editor/InsertTab";
import { TableTab } from "./editor/TableTab";
import { TableHandles, findTable } from "./editor/table-tools";
import {
  BookmarkDialog,
  EquationDialog,
  ImageDialog,
  LinkDialog,
  TableDialog,
  VideoDialog,
  type InsertDialogKind,
} from "./editor/InsertDialogs";
import { Outline } from "./editor/Outline";
import { FontDialog, ParagraphDialog } from "./editor/RibbonDialogs";
import { ViewTab, type ViewState } from "./editor/ViewTab";
import { WordTitleBar } from "./editor/WordTitleBar";

const TABS = [
  { id: "home", label: "Home" },
  { id: "insert", label: "Insert" },
  { id: "layout", label: "Layout" },
  { id: "review", label: "Review" },
  { id: "view", label: "View" },
] as const;

/** Word's contextual "Table Tools" tab — only shown with the cursor in a table. */
const TABLE_TAB = { id: "table", label: "Table" } as const;

type TabId = (typeof TABS)[number]["id"] | typeof TABLE_TAB.id;

/**
 * Word-style article editor.
 *
 * The chrome deliberately mirrors the Microsoft Word desktop window — blue
 * title bar with a Quick Access Toolbar, ribbon tabs, grouped ribbon with
 * dialog launchers, a page sheet, and a status bar with a zoom slider — so
 * anyone who has used Word can write a story without being taught anything.
 *
 * Props are unchanged, so both language editors in ArticleForm get this.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "এখানে লিখুন…",
  documentName = "নতুন আর্টিকেল",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  documentName?: string;
}) {
  const [tab, setTab] = useState<TabId>("home");
  const [ribbonOpen, setRibbonOpen] = useState(true);
  const [findOpen, setFindOpen] = useState(false);
  const [dialog, setDialog] = useState<
    "font" | "paragraph" | InsertDialogKind | ReviewDialogKind | null
  >(null);
  const [view, setViewState] = useState<ViewState>({
    pageMode: true,
    zoom: 100,
    fullscreen: false,
    outline: false,
    spellcheck: true,
  });

  const setView = useCallback(
    (patch: Partial<ViewState>) => setViewState((v) => ({ ...v, ...patch })),
    [],
  );
  const close = useCallback(() => setDialog(null), []);

  /**
   * Spellcheck is a property of the editable element, so flipping it has to
   * reach into editorProps. Both the View and Review tabs use this.
   */
  const toggleSpellcheck = useCallback(() => {
    setViewState((v) => {
      const next = !v.spellcheck;
      editorRef.current?.setOptions({
        editorProps: {
          ...editorRef.current.options.editorProps,
          attributes: {
            ...(editorRef.current.options.editorProps.attributes as Record<
              string,
              string
            >),
            spellcheck: String(next),
          },
        },
      });
      return { ...v, spellcheck: next };
    });
  }, []);

  const editorRef = useRef<ReturnType<typeof useEditor>>(null);

  const editor = useEditor({
    immediatelyRender: false,
    // The ribbon shows live active states, which only stay in sync if the
    // component re-renders per transaction.
    shouldRerenderOnTransaction: true,
    extensions: [...buildExtensions(placeholder), FindReplace],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps,
  });

  editorRef.current = editor;

  // Ctrl+F / Ctrl+H open find-and-replace; Esc leaves full screen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && (key === "f" || key === "h")) {
        e.preventDefault();
        setFindOpen(true);
      }
      if ((e.ctrlKey || e.metaKey) && key === "k") {
        e.preventDefault();
        setDialog("link");
      }
      if (e.key === "Escape") {
        setViewState((v) => (v.fullscreen ? { ...v, fullscreen: false } : v));
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!editor) {
    return (
      <div className="min-h-[480px] rounded border border-[#d4d4d4] bg-white" />
    );
  }

  // The contextual Table tab appears and disappears with the cursor, exactly
  // as Word's Table Tools do. Falling back to Home keeps a stale tab from
  // being left selected once the cursor leaves the table.
  const inTable = !!findTable(editor);
  const tabs = inTable ? [...TABS, TABLE_TAB] : TABS;
  const activeTab: TabId = tab === "table" && !inTable ? "home" : tab;

  const words = editor.storage.characterCount.words() as number;
  const characters = editor.storage.characterCount.characters() as number;
  // Bangla news copy is read at roughly 180 words a minute.
  const minutes = Math.max(1, Math.round(words / 180));
  const bn = (n: number) => n.toLocaleString("bn-BD");

  return (
    <div
      className={
        view.fullscreen
          ? "fixed inset-0 z-50 flex flex-col bg-[#f3f2f1]"
          : "flex flex-col overflow-hidden rounded border border-[#d4d4d4] bg-[#f3f2f1]"
      }
    >
      <div className="relative shrink-0">
        <WordTitleBar
          editor={editor}
          documentName={documentName}
          onOpenFind={() => setFindOpen(true)}
        />
      </div>

      {/* ---------- ribbon tabs ---------- */}
      <div className="flex shrink-0 items-end gap-0 border-b border-[#d4d4d4] bg-[#f3f2f1] pl-1">
        {/* Word puts "File" here; ours carries the masthead instead. */}
        <span className="mb-0 mr-1.5 flex h-[34px] items-center bg-white px-3">
          <Image
            src="/logo.png"
            alt="LinkNews24"
            width={2048}
            height={656}
            className="h-[26px] w-auto"
          />
        </span>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setTab(t.id);
              setRibbonOpen(true);
            }}
            className={`h-[34px] px-4 font-ui text-[11px] transition-colors ${
              activeTab === t.id && ribbonOpen
                ? "border-x border-t border-[#d4d4d4] bg-white font-semibold text-[#d81f26]"
                : "text-[#444] hover:bg-[#e1dfdd]"
            }`}
          >
            {t.label}
          </button>
        ))}
        <button
          type="button"
          title={ribbonOpen ? "রিবন গুটিয়ে ফেলুন" : "রিবন দেখান"}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setRibbonOpen((v) => !v)}
          className="ml-auto mr-1 flex h-[34px] w-6 items-center justify-center text-[#666] hover:bg-[#e1dfdd] hover:text-[#111]"
        >
          <ChevronUp
            className={`h-3.5 w-3.5 transition-transform ${
              ribbonOpen ? "" : "rotate-180"
            }`}
          />
        </button>
      </div>

      {/* ---------- ribbon ---------- */}
      {ribbonOpen && (
        <div className="shrink-0 border-b border-[#d4d4d4] bg-white">
          {activeTab === "home" && (
            <HomeTab
              editor={editor}
              onOpenFind={() => setFindOpen(true)}
              onOpenFontDialog={() => setDialog("font")}
              onOpenParagraphDialog={() => setDialog("paragraph")}
            />
          )}
          {activeTab === "insert" && (
            <InsertTab editor={editor} openDialog={setDialog} />
          )}
          {activeTab === "layout" && <LayoutTab editor={editor} />}
          {activeTab === "table" && <TableTab editor={editor} />}
          {activeTab === "review" && (
            <ReviewTab
              editor={editor}
              spellcheck={view.spellcheck}
              onToggleSpellcheck={toggleSpellcheck}
              openDialog={setDialog}
            />
          )}
          {activeTab === "view" && (
            <ViewTab
              view={view}
              setView={setView}
              onToggleSpellcheck={toggleSpellcheck}
            />
          )}
        </div>
      )}

      {findOpen && (
        <FindReplacePanel editor={editor} onClose={() => setFindOpen(false)} />
      )}

      {/* ---------- canvas ---------- */}
      <div className="flex min-h-0 flex-1">
        {view.outline && <Outline editor={editor} />}
        {/* Fixed height, not content height. `zoom` shrinks the page's layout
            box as well as its paint, so a content-sized canvas collapsed the
            whole editor when you zoomed out. Pinning the canvas keeps the
            window one size and lets only the sheet inside it grow or shrink. */}
        <div
          className={`min-h-0 flex-1 overflow-auto ${
            view.pageMode ? "bg-[#e6e6e6] p-6" : "bg-white"
          } ${view.fullscreen ? "h-full" : "h-[68vh]"}`}
        >
          {/* A4 width (794px at 96dpi) so the measure matches print, but the
              height fills the canvas and then grows with the text. A literal
              A4 height would mean scrolling through blank paper on every new
              article — the page is going on the web, not into a printer. */}
          <div
            style={{ zoom: `${view.zoom}%` }}
            className={
              view.pageMode
                ? "mx-auto flex min-h-[calc(68vh-3rem)] w-[794px] max-w-full flex-col bg-white px-[76px] py-[56px] shadow-[0_1px_6px_rgba(0,0,0,0.25)]"
                : "mx-auto flex w-full max-w-3xl flex-col px-4 py-3"
            }
          >
            {/* Stretch the editable area over the whole sheet, so clicking
                low on a mostly-empty page still puts the cursor in. */}
            <EditorContent editor={editor} className="flex flex-1 flex-col" />
            {/* Move / resize grips, drawn over the page — never saved. */}
            <TableHandles editor={editor} />
          </div>
        </div>
      </div>

      {/* ---------- status bar ---------- */}
      <div className="flex shrink-0 flex-wrap items-center gap-4 border-t border-[#d4d4d4] bg-[#14181f] px-3 py-1 font-ui text-[11px] text-white/90">
        <span>শব্দ: {bn(words)}</span>
        <span>অক্ষর: {bn(characters)}</span>
        <span>পড়তে ~{bn(minutes)} মিনিট</span>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            title="জুম কমান"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setView({ zoom: Math.max(view.zoom - 10, 50) })}
            className="flex h-4 w-4 items-center justify-center rounded-sm hover:bg-white/20"
          >
            −
          </button>
          <input
            type="range"
            min={50}
            max={200}
            step={10}
            value={view.zoom}
            onChange={(e) => setView({ zoom: Number(e.target.value) })}
            title={`জুম ${view.zoom}%`}
            className="h-1 w-28 cursor-pointer accent-white"
          />
          <button
            type="button"
            title="জুম বাড়ান"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setView({ zoom: Math.min(view.zoom + 10, 200) })}
            className="flex h-4 w-4 items-center justify-center rounded-sm hover:bg-white/20"
          >
            +
          </button>
          <span className="w-10 text-right tabular-nums">{view.zoom}%</span>
        </div>
      </div>

      {dialog === "font" && <FontDialog editor={editor} onClose={close} />}
      {dialog === "paragraph" && (
        <ParagraphDialog editor={editor} onClose={close} />
      )}
      {dialog === "image" && <ImageDialog editor={editor} onClose={close} />}
      {dialog === "video" && <VideoDialog editor={editor} onClose={close} />}
      {dialog === "link" && <LinkDialog editor={editor} onClose={close} />}
      {dialog === "bookmark" && (
        <BookmarkDialog editor={editor} onClose={close} />
      )}
      {dialog === "equation" && (
        <EquationDialog editor={editor} onClose={close} />
      )}
      {dialog === "table" && <TableDialog editor={editor} onClose={close} />}
      {dialog === "wordcount" && (
        <WordCountDialog editor={editor} onClose={close} />
      )}
      {dialog === "accessibility" && (
        <AccessibilityDialog editor={editor} onClose={close} />
      )}
    </div>
  );
}
