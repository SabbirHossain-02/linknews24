"use client";

import { useState } from "react";
import { keepFocus } from "./ui";

/**
 * Word's Symbol (Ω) and Emoji pickers.
 *
 * The symbol sets are chosen for a Bangladeshi newsroom rather than copied from
 * a generic Unicode chart: the taka sign and Bengali numerals come first,
 * because they are what a reporter actually reaches for.
 */
const SYMBOL_SETS: { name: string; chars: string[] }[] = [
  {
    name: "টাকা ও মুদ্রা",
    chars: ["৳", "$", "€", "£", "¥", "₹", "₽", "¢", "﷼"],
  },
  {
    name: "বাংলা সংখ্যা",
    chars: ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"],
  },
  {
    name: "গণিত",
    chars: ["×", "÷", "±", "≠", "≈", "≤", "≥", "√", "∞", "%", "‰", "°", "π", "Σ", "Δ", "µ"],
  },
  {
    name: "ভগ্নাংশ",
    chars: ["½", "⅓", "⅔", "¼", "¾", "⅕", "⅛", "⅜", "⅝", "⅞"],
  },
  {
    name: "বিরাম ও চিহ্ন",
    chars: ["“", "”", "‘", "’", "—", "–", "…", "•", "·", "§", "¶", "†", "‡", "«", "»"],
  },
  {
    name: "তীর ও অন্যান্য",
    chars: ["→", "←", "↑", "↓", "↔", "⇒", "©", "®", "™", "★", "☆", "✓", "✕", "☎", "✉", "⚠"],
  },
];

const EMOJI_SETS: { name: string; chars: string[] }[] = [
  {
    name: "মুখভঙ্গি",
    chars: ["😀","😃","😄","😁","😅","😂","🙂","😉","😊","😍","🤔","😐","😴","😢","😭","😡","😱","🤝","👍","👎","👏","🙏"],
  },
  {
    name: "খবর ও কাজ",
    chars: ["📰","📷","🎥","🎙","📢","📌","📊","📈","📉","🗓","⏰","🔔","💡","🔍","✏️","📝","📎","🔗","⚖️","🏛","🚨","🚑"],
  },
  {
    name: "খেলা ও আবহাওয়া",
    chars: ["⚽","🏏","🏆","🥇","🎾","🏐","🌧","⛈","🌪","☀️","🌤","❄️","🌊","🔥","🌍","🇧🇩"],
  },
];

function CharGrid({
  sets,
  onPick,
  cols,
}: {
  sets: { name: string; chars: string[] }[];
  onPick: (char: string) => void;
  cols: number;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <div className="p-2" onMouseLeave={() => setPreview(null)}>
      <div className="flex flex-col gap-2">
        {sets.map((set) => (
          <div key={set.name}>
            <p className="mb-1 font-ui text-[9px] font-bold uppercase tracking-wide text-[#888]">
              {set.name}
            </p>
            <div
              className="grid gap-[2px]"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {set.chars.map((char) => (
                <button
                  key={char}
                  type="button"
                  title={char}
                  onMouseDown={keepFocus}
                  onMouseEnter={() => setPreview(char)}
                  onClick={() => onPick(char)}
                  className="flex h-7 items-center justify-center rounded-sm border border-transparent text-[15px] leading-none hover:border-[#d81f26] hover:bg-[#fbe3e4]"
                >
                  {char}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 border-t border-[#e1dfdd] pt-1.5 text-center font-ui text-[11px] text-[#666]">
        {preview ? `বসবে: ${preview}` : "বেছে নিন"}
      </p>
    </div>
  );
}

export function SymbolPicker({ onPick }: { onPick: (char: string) => void }) {
  return <CharGrid sets={SYMBOL_SETS} onPick={onPick} cols={10} />;
}

export function EmojiPicker({ onPick }: { onPick: (char: string) => void }) {
  return <CharGrid sets={EMOJI_SETS} onPick={onPick} cols={11} />;
}
