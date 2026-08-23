"use client";

import {
  FileText,
  Maximize2,
  Minimize2,
  PanelLeft,
  ScrollText,
  SpellCheck,
} from "lucide-react";
import { BigBtn, Combo, Group, MenuItem } from "./ui";

export interface ViewState {
  pageMode: boolean;
  zoom: number;
  fullscreen: boolean;
  outline: boolean;
  spellcheck: boolean;
}

const ZOOMS = [50, 75, 90, 100, 125, 150, 200];

export function ViewTab({
  view,
  setView,
  onToggleSpellcheck,
}: {
  view: ViewState;
  setView: (patch: Partial<ViewState>) => void;
  onToggleSpellcheck: () => void;
}) {
  return (
    <div className="flex h-[92px] items-stretch overflow-x-auto bg-white">
      <Group label="Views">
        <BigBtn
          title="পেজ ভিউ — Word-এর মতো সাদা কাগজে"
          label="Print Layout"
          active={view.pageMode}
          icon={<FileText className="h-5 w-5" />}
          onClick={() => setView({ pageMode: true })}
        />
        <BigBtn
          title="ওয়েব ভিউ — সাইটে যে প্রস্থে দেখাবে"
          label="Web Layout"
          active={!view.pageMode}
          icon={<ScrollText className="h-5 w-5" />}
          onClick={() => setView({ pageMode: false })}
        />
      </Group>

      <Group label="Zoom">
        <Combo label={`${view.zoom}%`} width="w-20" title="জুম">
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
        </Combo>
      </Group>

      <Group label="Show">
        <BigBtn
          title="ডকুমেন্ট আউটলাইন — শিরোনামের তালিকা"
          label="Outline"
          active={view.outline}
          icon={<PanelLeft className="h-5 w-5" />}
          onClick={() => setView({ outline: !view.outline })}
        />
        <BigBtn
          title="বানান পরীক্ষা চালু/বন্ধ"
          label="Spelling"
          active={view.spellcheck}
          icon={<SpellCheck className="h-5 w-5" />}
          onClick={onToggleSpellcheck}
        />
        <BigBtn
          title="ফুল স্ক্রিন (Esc দিয়ে বেরোন)"
          label="Full Screen"
          active={view.fullscreen}
          icon={
            view.fullscreen ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )
          }
          onClick={() => setView({ fullscreen: !view.fullscreen })}
        />
      </Group>
    </div>
  );
}
