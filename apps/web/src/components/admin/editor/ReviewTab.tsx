"use client";

import type { Editor } from "@tiptap/react";
import {
  Accessibility,
  Calculator,
  Mic,
  MicOff,
  SpellCheck,
  Square,
  Volume2,
} from "lucide-react";
import { BigBtn, Group } from "./ui";
import { useDictate, useReadAloud } from "./use-speech";

export type ReviewDialogKind = "wordcount" | "accessibility";

/**
 * Word's Review tab.
 *
 * Read Aloud and Dictate run on the browser's own speech engines — free, no
 * key, nothing sent to a server. Where a browser lacks one, the button is
 * hidden rather than offered and then failing.
 */
export function ReviewTab({
  editor,
  spellcheck,
  onToggleSpellcheck,
  openDialog,
}: {
  editor: Editor;
  spellcheck: boolean;
  onToggleSpellcheck: () => void;
  openDialog: (kind: ReviewDialogKind) => void;
}) {
  const read = useReadAloud(editor);
  const dictate = useDictate(editor);

  return (
    <div className="flex h-[92px] items-stretch overflow-x-auto bg-white">
      <Group label="Proofing">
        <BigBtn
          title="শব্দ, অক্ষর, অনুচ্ছেদ ও পড়ার সময়"
          label="Word Count"
          icon={<Calculator className="h-5 w-5" />}
          onClick={() => openDialog("wordcount")}
        />
        <BigBtn
          title="বানান পরীক্ষা চালু/বন্ধ"
          label="Spelling"
          active={spellcheck}
          icon={<SpellCheck className="h-5 w-5" />}
          onClick={onToggleSpellcheck}
        />
      </Group>

      {(read.supported || dictate.supported) && (
        <Group label="Speech">
          {read.supported && (
            <BigBtn
              title="লেখা পড়ে শোনাবে — সিলেক্ট করা থাকলে শুধু সেটুকু"
              label={read.speaking ? "Stop" : "Read Aloud"}
              active={read.speaking}
              icon={
                read.speaking ? (
                  <Square className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )
              }
              onClick={read.toggle}
            />
          )}
          {read.notice && (
            <button
              type="button"
              title="বন্ধ করুন"
              onMouseDown={(e) => e.preventDefault()}
              onClick={read.dismissNotice}
              className="max-w-[300px] self-center rounded-sm border border-[#f0c36d] bg-[#fdf6e3] px-2 py-1 text-left font-ui text-[10px] leading-snug text-[#7a5b12]"
            >
              {read.notice}
            </button>
          )}
          {dictate.supported && (
            <BigBtn
              title="মুখে বলুন, লেখা হয়ে যাবে (বাংলা)"
              label={dictate.listening ? "Stop" : "Dictate"}
              active={dictate.listening}
              icon={
                dictate.listening ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )
              }
              onClick={dictate.toggle}
            />
          )}
        </Group>
      )}

      <Group label="Accessibility">
        <BigBtn
          title="ছবিতে alt আছে কি না, শিরোনামের ক্রম ঠিক কি না — পরীক্ষা করুন"
          label="Check"
          icon={<Accessibility className="h-5 w-5" />}
          onClick={() => openDialog("accessibility")}
        />
      </Group>
    </div>
  );
}
