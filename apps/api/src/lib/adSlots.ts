export type Placement =
  | "HEADER"
  | "LEFT"
  | "SIDEBAR"
  | "IN_ARTICLE"
  | "FOOTER"
  | "POPUP";

export const PLACEMENTS: Placement[] = [
  "HEADER",
  "LEFT",
  "SIDEBAR",
  "IN_ARTICLE",
  "FOOTER",
  "POPUP",
];

export interface AdSlotDef {
  placement: Placement;
  pricePerDay: number; // BDT
  size: string; // recommended banner dimensions
}

// Slot catalogue + pricing. Top-of-page (nav/header) is the most visible → priciest.
export const AD_SLOTS: AdSlotDef[] = [
  { placement: "HEADER", pricePerDay: 2000, size: "970×250 / 970×90 / 728×90" },
  { placement: "POPUP", pricePerDay: 1500, size: "600×500 / 500×500" },
  { placement: "IN_ARTICLE", pricePerDay: 800, size: "728×90 / 300×250 / 728×250" },
  { placement: "LEFT", pricePerDay: 700, size: "160×600 / 120×600" },
  { placement: "SIDEBAR", pricePerDay: 600, size: "300×250 / 300×600" },
  { placement: "FOOTER", pricePerDay: 300, size: "970×90 / 728×90" },
];

export function slotPrice(placement: string): number {
  return AD_SLOTS.find((s) => s.placement === placement)?.pricePerDay ?? 0;
}
