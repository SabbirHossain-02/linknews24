"use client";

/**
 * Fonts offered in the ribbon's font picker.
 *
 * Two honest tiers, because a web page is not a Word document — Word embeds
 * its fonts in the file, a web page cannot. A font only reaches the reader if
 * their device has it too.
 *
 *  - `bundled`: shipped by the site itself, so every reader sees exactly this.
 *  - `system`:  common on Bangladeshi machines, but a reader without it falls
 *               back. Fine for drafting, risky for a published headline.
 *
 * The picker labels the difference rather than pretending every font is safe.
 */
export interface FontOption {
  label: string;
  /** CSS font-family value. */
  value: string;
  tier: "bundled" | "system" | "installed";
  /** Bengali-capable — used to group the list. */
  bangla?: boolean;
}

export const BUNDLED_FONTS: FontOption[] = [
  {
    label: "Siyam Rupali",
    value: "var(--font-siyam-rupali), sans-serif",
    tier: "bundled",
    bangla: true,
  },
  {
    label: "Hind Siliguri",
    value: "var(--font-hind-siliguri), sans-serif",
    tier: "bundled",
    bangla: true,
  },
  { label: "Inter", value: "var(--font-inter), sans-serif", tier: "bundled" },
];

/** Bengali faces most Bangladeshi desktops already have. */
export const SYSTEM_BANGLA_FONTS: FontOption[] = [
  { label: "Kalpurush", value: "Kalpurush, sans-serif", tier: "system", bangla: true },
  { label: "SolaimanLipi", value: "SolaimanLipi, sans-serif", tier: "system", bangla: true },
  { label: "Nikosh", value: "Nikosh, sans-serif", tier: "system", bangla: true },
  { label: "NikoshBAN", value: "NikoshBAN, sans-serif", tier: "system", bangla: true },
  { label: "AdorshoLipi", value: "AdorshoLipi, sans-serif", tier: "system", bangla: true },
  { label: "Mukti", value: "Mukti, sans-serif", tier: "system", bangla: true },
  { label: "Shonar Bangla", value: "'Shonar Bangla', sans-serif", tier: "system", bangla: true },
  { label: "Vrinda", value: "Vrinda, sans-serif", tier: "system", bangla: true },
  { label: "Noto Sans Bengali", value: "'Noto Sans Bengali', sans-serif", tier: "system", bangla: true },
  { label: "Noto Serif Bengali", value: "'Noto Serif Bengali', serif", tier: "system", bangla: true },
];

/** The Latin faces Word's own list opens with. */
export const SYSTEM_LATIN_FONTS: FontOption[] = [
  { label: "Arial", value: "Arial, sans-serif", tier: "system" },
  { label: "Calibri", value: "Calibri, sans-serif", tier: "system" },
  { label: "Cambria", value: "Cambria, serif", tier: "system" },
  { label: "Candara", value: "Candara, sans-serif", tier: "system" },
  { label: "Century Gothic", value: "'Century Gothic', sans-serif", tier: "system" },
  { label: "Comic Sans MS", value: "'Comic Sans MS', cursive", tier: "system" },
  { label: "Consolas", value: "Consolas, monospace", tier: "system" },
  { label: "Constantia", value: "Constantia, serif", tier: "system" },
  { label: "Corbel", value: "Corbel, sans-serif", tier: "system" },
  { label: "Courier New", value: "'Courier New', monospace", tier: "system" },
  { label: "Franklin Gothic", value: "'Franklin Gothic Medium', sans-serif", tier: "system" },
  { label: "Garamond", value: "Garamond, serif", tier: "system" },
  { label: "Georgia", value: "Georgia, serif", tier: "system" },
  { label: "Impact", value: "Impact, sans-serif", tier: "system" },
  { label: "Lucida Sans", value: "'Lucida Sans', sans-serif", tier: "system" },
  { label: "Palatino Linotype", value: "'Palatino Linotype', serif", tier: "system" },
  { label: "Segoe UI", value: "'Segoe UI', sans-serif", tier: "system" },
  { label: "Tahoma", value: "Tahoma, sans-serif", tier: "system" },
  { label: "Times New Roman", value: "'Times New Roman', serif", tier: "system" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif", tier: "system" },
  { label: "Verdana", value: "Verdana, sans-serif", tier: "system" },
];

export const DEFAULT_FONTS: FontOption[] = [
  ...BUNDLED_FONTS,
  ...SYSTEM_BANGLA_FONTS,
  ...SYSTEM_LATIN_FONTS,
];

/** Word's font-size dropdown values. */
export const FONT_SIZES = [
  8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72,
];

export const LINE_HEIGHTS = ["1", "1.15", "1.5", "2", "2.5", "3"];

// --- Local Font Access (Chrome 103+) ---

interface LocalFontData {
  family: string;
  fullName: string;
  postscriptName: string;
  style: string;
}

type FontQuery = () => Promise<LocalFontData[]>;

function localFontApi(): FontQuery | null {
  if (typeof window === "undefined") return null;
  const fn = (window as unknown as { queryLocalFonts?: FontQuery })
    .queryLocalFonts;
  return typeof fn === "function" ? fn.bind(window) : null;
}

/** Whether this browser can list the fonts installed on the machine. */
export function canReadInstalledFonts(): boolean {
  return localFontApi() !== null;
}

/**
 * Asks the browser for the machine's installed fonts, the way Word lists
 * everything on the system.
 *
 * Chrome shows a permission prompt, so this must be called from a click.
 * Returns null when unsupported or when the user declines — callers should say
 * so plainly rather than silently showing nothing.
 */
export async function loadInstalledFonts(): Promise<FontOption[] | null> {
  const query = localFontApi();
  if (!query) return null;

  try {
    const fonts = await query();
    const seen = new Set<string>();
    const options: FontOption[] = [];

    for (const font of fonts) {
      const family = font.family?.trim();
      if (!family || seen.has(family)) continue;
      seen.add(family);
      options.push({
        label: family,
        // Quote the family so names with spaces stay valid CSS.
        value: `'${family.replace(/'/g, "")}', sans-serif`,
        tier: "installed",
      });
    }

    return options.sort((a, b) => a.label.localeCompare(b.label));
  } catch {
    // Permission denied, or the prompt was dismissed.
    return null;
  }
}
