
import type { ApiCategory } from "@/lib/api";

export interface NavChild {
  key: string;
  label: string;
  labelEn: string;
  href: string;
}

export interface NavEntry {
  key: string;
  label: string;
  labelEn: string;
  /**
   * The entry's own page. A dropdown parent keeps this too — a category with
   * sub-categories is still a real section front, and the nav must not swallow
   * the only way to reach it.
   */
  href?: string;
  children?: NavChild[];
}

/**
 * How many categories sit directly on the nav bar before the rest are folded
 * into the "others" dropdown. Beyond this the bar starts scrolling sideways,
 * which hides links rather than showing them.
 */
const MAX_TOP_LEVEL = 12;

/**
 * The three services. Pages, not categories — they have no row in the
 * database.
 *
 * Plain links, no dropdowns: a menu of 64 districts or 8 blood groups made the
 * reader choose before seeing anybody, and hid the service page itself behind
 * its own menu. Each page now opens on the full list with the filters on it.
 */
const DIRECTORY_ENTRIES: NavEntry[] = [
  { key: "lawyers", label: "আইন সেবা", labelEn: "Legal Service", href: "/lawyers" },
  { key: "blood", label: "রক্ত সেবা", labelEn: "Blood Service", href: "/blood" },
  {
    key: "hospitals",
    label: "হাসপাতাল সেবা",
    labelEn: "Hospital Service",
    href: "/hospitals",
  },
];

/**
 * Builds the site navigation from the categories the CMS currently holds.
 *
 * The menu used to be a hand-written list, so deleting a category in the admin
 * left a dead link in the nav until someone edited the code. It is derived from
 * live data now: a category the editor removes disappears, one they add shows
 * up, and the order follows the `order` column they set.
 *
 * A category with children (via `parentId`) becomes a dropdown, so an editor
 * can group "জাতীয় / রাজনীতি / সচিবালয়" under one heading from the CMS
 * without any code change.
 */
export function buildNav(categories: ApiCategory[]): NavEntry[] {
  const byParent = new Map<string, ApiCategory[]>();
  for (const category of categories) {
    if (!category.parentId) continue;
    const siblings = byParent.get(category.parentId) ?? [];
    siblings.push(category);
    byParent.set(category.parentId, siblings);
  }

  const toChild = (category: ApiCategory): NavChild => ({
    key: category.id,
    label: category.name,
    labelEn: category.nameEn,
    href: `/${category.slug}`,
  });

  const roots = categories
    .filter((category) => !category.parentId)
    .map((category): NavEntry => {
      const children = byParent.get(category.id);
      return {
        key: category.id,
        label: category.name,
        labelEn: category.nameEn,
        href: `/${category.slug}`,
        children: children?.length ? children.map(toChild) : undefined,
      };
    });

  const visible = roots.slice(0, MAX_TOP_LEVEL);
  const overflow = roots.slice(MAX_TOP_LEVEL);

  const entries = [...visible, ...DIRECTORY_ENTRIES];

  if (overflow.length) {
    entries.push({
      key: "others",
      label: "অন্যান্য",
      labelEn: "Others",
      children: overflow.flatMap((entry) =>
        // A group that overflowed contributes its children, not itself.
        entry.children ??
        [
          {
            key: entry.key,
            label: entry.label,
            labelEn: entry.labelEn,
            href: entry.href!,
          },
        ],
      ),
    });
  }

  return entries;
}

/** The footer lists the news categories, without the directory dropdowns. */
export function footerCategories(categories: ApiCategory[]): NavChild[] {
  return categories.slice(0, 14).map((category) => ({
    key: category.id,
    label: category.name,
    labelEn: category.nameEn,
    href: `/${category.slug}`,
  }));
}
