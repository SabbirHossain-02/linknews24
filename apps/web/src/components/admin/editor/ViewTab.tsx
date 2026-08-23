"use client";

import type { Editor } from "@tiptap/react";
import {
  FileText,
  Maximize2,
  Minimize2,
  PanelLeft,
  ScrollText,
  SpellCheck,
} from "lucide-react";
import { Btn, Dropdown, Group, MenuItem } from "./ui";

export interface ViewState {
  pageMode: boolean;
  zoom: number;
  fullscreen: boolean;
  outline: boolean;
  spellcheck: boolean;
}

const ZOOMS = [50, 75, 90, 100, 125, 150, 200];

export function ViewTab({
  editor,
  view,
  setView,
}: {
  editor: Editor;
  view: ViewState;
  setView: (patch: Partial<ViewState>) => void;
}) {
  return (
    <div className="flex h-[74px] items-stretch overflow-x-auto">
      <Group label="লেআউট">
        <Btn
          big
          active={view.pageMode}
          title="পেজ ভিউ — Word-এর মতো সাদা কাগজে লিখুন"
          onClick={() => setView({ pageMode: true })}
        >
          <FileText className="h-5 w-5" />
          পেজ ভিউ
        </Btn>
        <Btn
          big
          active={!view.pageMode}
          title="ওয়েব ভিউ — সাইটে যেভাবে দেখাবে সেই প্রস্থে"
          onClick={() => setView({ pageMode: false })}
        >
          <ScrollText className="h-5 w-5" />
          ওয়েব ভিউ
        </Btn>
      </Group>

      <Group label="জুম">
        <Dropdown label={`${view.zoom}%`} width="w-20" title="জুম">
          {(close) =>
            ZOOMS.map((z) => (
              <MenuItem
                key={z}
                active={view.zoom === z}
                onClick={() => {
                  setView({ zoom: z });
                  close();
                }}
              >
                {z}%
              </MenuItem>
            ))
          }
        </Dropdown>
      </Group>

      <Group label="দেখান">
        <Btn
          big
          active={view.outline}
          title="ডকুমেন্ট আউটলাইন — শিরোনামগুলোর তালিকা"
          onClick={() => setView({ outline: !view.outline })}
        >
          <PanelLeft className="h-5 w-5" />
          আউটলাইন
        </Btn>
        <Btn
          big
          active={view.spellcheck}
          title="বানান পরীক্ষা চালু/বন্ধ"
          onClick={() => {
            const next = !view.spellcheck;
            setView({ spellcheck: next });
            editor.setOptions({
              editorProps: {
                ...editor.options.editorProps,
                attributes: {
                  ...(editor.options.editorProps.attributes as Record<string, string>),
                  spellcheck: String(next),
                },
              },
            });
          }}
        >
          <SpellCheck className="h-5 w-5" />
          বানান
        </Btn>
        <Btn
          big
          active={view.fullscreen}
          title="ফুল স্ক্রিন (F11-এর মতো, Esc দিয়ে বেরোন)"
          onClick={() => setView({ fullscreen: !view.fullscreen })}
        >
          {view.fullscreen ? (
            <Minimize2 className="h-5 w-5" />
          ) : (
            <Maximize2 className="h-5 w-5" />
          )}
          ফুল স্ক্রিন
        </Btn>
      </Group>
    </div>
  );
}
