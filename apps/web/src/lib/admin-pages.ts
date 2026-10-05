import type { AdminKey } from "./admin-i18n";

/** Which admin page a path is, by its sidebar name. Longest prefix wins. */
const PAGES: [string, AdminKey][] = [
  ["/admin/articles", "articles"],
  ["/admin/categories", "categoriesTags"],
  ["/admin/breaking", "breaking"],
  ["/admin/homepage", "homepageBuilder"],
  ["/admin/live-tv", "liveTv"],
  ["/admin/media", "media"],
  ["/admin/epaper", "epaper"],
  ["/admin/lawyers", "lawyers"],
  ["/admin/donors", "donors"],
  ["/admin/hospitals", "hospitals"],
  ["/admin/newsletter", "newsletter"],
  ["/admin/ads", "ads"],
  ["/admin/comments", "comments"],
  ["/admin/seo", "seo"],
  ["/admin/settings", "settings"],
  ["/admin/users", "usersRoles"],
  ["/admin/roles", "rolesNav"],
  ["/admin/approvals", "approvalsNav"],
  ["/admin/team", "teamNav"],
];

/**
 * Where someone is in the panel, in words — "Writing a new story", "Editing a
 * story: <headline>", or the section's sidebar name — for the team views.
 */
export function adminPageLabel(
  visit: { path: string; articleId?: string; articleTitle?: string },
  t: (k: AdminKey) => string,
  ax: (s: string) => string,
): string {
  if (visit.path === "/admin/articles/new") return ax("নতুন খবর লিখছেন");
  if (visit.articleId)
    return `${ax("খবর এডিট করছেন")}: ${visit.articleTitle ?? ax("(শিরোনাম নেই)")}`;
  if (visit.path === "/admin") return t("dashboard");
  const hit = PAGES.filter(([p]) => visit.path === p || visit.path.startsWith(p + "/")).sort(
    (a, b) => b[0].length - a[0].length,
  )[0];
  return hit ? t(hit[1]) : visit.path;
}
