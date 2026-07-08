import type { Article } from "@/types/content";

const toneGradients: Record<Article["imageTone"], string> = {
  navy: "from-[#1c2333] to-[#0d1017]",
  crimson: "from-[#8a1a20] to-[#3d0c0f]",
  slate: "from-[#3f4756] to-[#1e232c]",
  amber: "from-[#8a5a1a] to-[#3d270c]",
};

export function toneGradientClass(tone: Article["imageTone"]): string {
  return `bg-gradient-to-br ${toneGradients[tone]}`;
}
