"use client";

import { useCallback, useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import Image from "next/image";
import { ChevronUp } from "lucide-react";
import { buildExtensions, editorProps } from "./editor/extensions";
import { FindReplace } from "./editor/find-replace";
import { FindReplacePanel } from "./editor/FindReplacePanel";
import { HomeTab } from "./editor/HomeTab";
import { Outline } from "./editor/Outline";
import { FontDialog, ParagraphDialog } from "./editor/RibbonDialogs";
import { ViewTab, type ViewState } from "./editor/ViewTab";
import { WordTitleBar } from "./editor/WordTitleBar";

const TABS = [
  { id: "home", label: "Home" },
  { id: "view", label: "View" },
] as const;

type TabId = (typeof TABS)[number]["id"];

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
  const [dialog, setDialog] = useState<"font" | "paragraph" | null>(null);
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

  // Ctrl+F / Ctrl+H open find-and-replace; Esc leaves full screen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && (key === "f" || key === "h")) {
        e.preventDefault();
        setFindOpen(true);
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
        <span className="mb-0 mr-1 flex h-[26px] items-center bg-white px-2.5">
          <Image
            src="/logo.png"
            alt="LinkNews24"
            width={2048}
            height={656}
            className="h-3.5 w-auto"
          />
        </span>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              setTab(t.id);
              setRibbonOpen(true);
            }}
            className={`h-[26px] px-4 font-ui text-[11px] transition-colors ${
              tab === t.id && ribbonOpen
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
          className="ml-auto mr-1 flex h-[26px] w-6 items-center justify-center text-[#666] hover:bg-[#e1dfdd] hover:text-[#111]"
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
          {tab === "home" && (
            <HomeTab
              editor={editor}
              onOpenFind={() => setFindOpen(true)}
              onOpenFontDialog={() => setDialog("font")}
              onOpenParagraphDialog={() => setDialog("paragraph")}
            />
          )}
          {tab === "view" && (
            <ViewTab editor={editor} view={view} setView={setView} />
          )}
        </div>
      )}

      {findOpen && (
        <FindReplacePanel editor={editor} onClose={() => setFindOpen(false)} />
      )}

      {/* ---------- canvas ---------- */}
      <div className="flex min-h-0 flex-1">
        {view.outline && <Outline editor={editor} />}
        <div
          className={`min-h-0 flex-1 overflow-y-auto ${
            view.pageMode ? "bg-[#e6e6e6] p-6" : "bg-white"
          } ${view.fullscreen ? "" : "max-h-[68vh]"}`}
        >
          <div
            style={{ zoom: `${view.zoom}%` }}
            className={
              view.pageMode
                ? "mx-auto w-full max-w-[794px] bg-white px-[76px] py-[64px] shadow-[0_1px_6px_rgba(0,0,0,0.25)]"
                : "mx-auto w-full max-w-3xl px-4 py-3"
            }
          >
            <EditorContent editor={editor} />
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

      {dialog === "font" && (
        <FontDialog editor={editor} onClose={() => setDialog(null)} />
      )}
      {dialog === "paragraph" && (
        <ParagraphDialog editor={editor} onClose={() => setDialog(null)} />
      )}
    </div>
  );
}
