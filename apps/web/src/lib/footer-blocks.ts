/**
 * The parts of the site footer the owner can switch off from Settings.
 *
 * Kept in its own file so the settings page and the footer cannot drift apart —
 * adding a name here is what puts a switch on that page — and so the admin
 * bundle does not have to pull in the footer component to read the list.
 */
export const FOOTER_BLOCKS = [
  "tagline",
  "social",
  "app",
  "categories",
  "company",
  "newsletter",
  "contact",
  "editor",
] as const;

export type FooterBlock = (typeof FOOTER_BLOCKS)[number];

/** Anything not explicitly switched off is shown. */
export function footerShows(
  footer: Partial<Record<FooterBlock, boolean>> | undefined,
  block: FooterBlock,
): boolean {
  return footer?.[block] !== false;
}
