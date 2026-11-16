/**
 * Dhaka is offered as four districts — north, south, east, west (the areas
 * each covers are listed in the web app's lib/dhaka-zones.ts). The old single
 * "dhaka" district is no longer offered anywhere; as a *filter*, "dhaka"
 * means all four parts together.
 */
export const DHAKA_ALL_SLUG = "dhaka";

export const DHAKA_ZONE_SLUGS = ["dhaka-north", "dhaka-south", "dhaka-east", "dhaka-west"];

/**
 * The `district` condition for a filter by slug, with "dhaka" meaning all four
 * parts — and any listing still filed under the old single district, which
 * would otherwise vanish from every Dhaka filter until someone re-files it.
 */
export function districtSlugWhere(slug: string) {
  return slug === DHAKA_ALL_SLUG
    ? { slug: { in: [...DHAKA_ZONE_SLUGS, DHAKA_ALL_SLUG] } }
    : { slug };
}
