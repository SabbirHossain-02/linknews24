"use client";

import { useCallback, useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { buildExtensions, editorProps } from "./editor/extensions";
import { FindReplace } from "./editor/find-replace";
import { FindReplacePanel } from "./editor/FindReplacePanel";
import { HomeTab } from "./editor/HomeTab";
import { Outline } from "./editor/Outline";
import { ViewTab, type ViewState } from "./editor/ViewTab";

const TABS = [
  { id: "home", label: "হোম" },
  { id: "view", label: "ভিউ" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/**
 * Word-style article editor.
 *
 * The public API is deliberately unchanged (`value` / `onChange` / `placeholder`)
 * so both the Bangla and English body fields in ArticleForm get the same ribbon
 * without any other change.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "এখানে লিখুন…",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const [tab, setTab] = useState<TabId>("home");
  const [findOpen, setFindOpen] = useState(false);
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
    // The ribbon shows live active states (bold on/off, current alignment…),
    // which only stay in sync if the component re-renders per transaction.
    shouldRerenderOnTransaction: true,
    extensions: [...buildExtensions(placeholder), FindReplace],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps,
  });

  // Ctrl+F opens find-and-replace; Esc leaves full screen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
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
      <div className="min-h-[420px] rounded-lg border border-border bg-background" />
    );
  }

  const words = editor.storage.characterCount.words() as number;
  const characters = editor.storage.characterCount.characters() as number;
  // Bangla news copy is read at roughly 180 words a minute.
  const minutes = Math.max(1, Math.round(words / 180));

  return (
    <div
      className={
        view.fullscreen
          ? "fixed inset-0 z-50 flex flex-col bg-background"
          : "flex flex-col overflow-hidden rounded-lg border border-border bg-background"
      }
    >
      {/* ---------- ribbon tabs ---------- */}
      <div className="flex shrink-0 items-center gap-1 border-b border-border bg-surface px-2 pt-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setTab(t.id)}
            className={`rounded-t px-4 py-1.5 font-ui text-xs transition-colors ${
              tab === t.id
                ? "border border-b-0 border-border bg-background font-semibold text-brand-crimson"
                : "text-foreground-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ---------- ribbon ---------- */}
      <div className="relative shrink-0 border-b border-border bg-background px-1">
        {tab === "home" && (
          <HomeTab editor={editor} onOpenFind={() => setFindOpen(true)} />
        )}
        {tab === "view" && (
          <ViewTab editor={editor} view={view} setView={setView} />
        )}
      </div>

      {findOpen && (
        <FindReplacePanel editor={editor} onClose={() => setFindOpen(false)} />
      )}

      {/* ---------- canvas ---------- */}
      <div className="flex min-h-0 flex-1">
        {view.outline && <Outline editor={editor} />}
        <div
          className={`min-h-0 flex-1 overflow-y-auto ${
            view.pageMode ? "bg-[#f3f4f6] p-6" : "bg-background"
          } ${view.fullscreen ? "" : "max-h-[70vh]"}`}
        >
          <div
            style={{ zoom: `${view.zoom}%` }}
            className={
              view.pageMode
                ? "mx-auto w-full max-w-[794px] rounded-sm bg-white px-[76px] py-[64px] shadow-md"
                : "mx-auto w-full max-w-3xl px-4 py-3"
            }
          >
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* ---------- status bar ---------- */}
      <div className="flex shrink-0 flex-wrap items-center gap-4 border-t border-border bg-surface px-3 py-1.5 font-ui text-[11px] text-foreground-muted">
        <span>শব্দ: {words.toLocaleString("bn-BD")}</span>
        <span>অক্ষর: {characters.toLocaleString("bn-BD")}</span>
        <span>পড়তে ~{minutes.toLocaleString("bn-BD")} মিনিট</span>
        <span className="ml-auto">{view.zoom}%</span>
      </div>
    </div>
  );
}
