import {
  CAN_DIRECTORY,
  CAN_MANAGE,
  CAN_MODERATE,
  CAN_PUBLISH,
  CAN_WRITE,
} from "./roles";

/**
 * What each role may do — built from the very lists that guard the routes.
 *
 * The point of deriving it rather than writing it out again is that the Roles
 * page cannot end up describing permissions the server does not enforce. Change
 * a guard in roles.ts and this table changes with it.
 */

export const ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "EDITOR",
  "MODERATOR",
  "REPORTER",
] as const;

export type Role = (typeof ROLES)[number];

const SUPER_ONLY = ["SUPER_ADMIN"];

/** Everyone who can sign in may look at the dashboard and their own profile. */
const EVERYONE = [...ROLES];

export interface Capability {
  key: string;
  /** Which admin page it belongs to, so the page can group the rows. */
  group: "content" | "directory" | "site" | "account";
  roles: readonly string[];
}

export const CAPABILITIES: Capability[] = [
  // --- content ---
  { key: "writeArticles", group: "content", roles: CAN_WRITE },
  { key: "publishArticles", group: "content", roles: CAN_PUBLISH },
  { key: "deleteArticles", group: "content", roles: CAN_PUBLISH },
  { key: "manageCategories", group: "content", roles: CAN_PUBLISH },
  { key: "deleteCategories", group: "content", roles: CAN_MANAGE },
  { key: "breakingNews", group: "content", roles: CAN_PUBLISH },
  { key: "epaper", group: "content", roles: CAN_PUBLISH },
  { key: "media", group: "content", roles: CAN_WRITE },
  { key: "moderateComments", group: "content", roles: CAN_MODERATE },

  // --- reader submissions ---
  { key: "reviewListings", group: "directory", roles: CAN_DIRECTORY },
  { key: "manageDirectories", group: "directory", roles: CAN_DIRECTORY },

  // --- the site itself ---
  { key: "homepageBuilder", group: "site", roles: CAN_MANAGE },
  { key: "liveTv", group: "site", roles: CAN_MANAGE },
  { key: "ads", group: "site", roles: CAN_MANAGE },
  { key: "newsletter", group: "site", roles: CAN_MANAGE },
  { key: "seo", group: "site", roles: CAN_MANAGE },
  { key: "siteSettings", group: "site", roles: CAN_MANAGE },

  // --- accounts ---
  { key: "ownProfile", group: "account", roles: EVERYONE },
  { key: "manageUsers", group: "account", roles: SUPER_ONLY },
];

export function can(role: string, key: string): boolean {
  const cap = CAPABILITIES.find((c) => c.key === key);
  return !!cap && cap.roles.includes(role);
}

/** The matrix the admin panel renders, plus which pages each role may open. */
export function permissionMatrix() {
  return {
    roles: ROLES,
    capabilities: CAPABILITIES.map((c) => ({
      key: c.key,
      group: c.group,
      roles: [...c.roles].filter((r) => (ROLES as readonly string[]).includes(r)),
    })),
  };
}
