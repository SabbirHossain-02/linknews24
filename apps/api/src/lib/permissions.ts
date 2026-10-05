import type { Role } from "@prisma/client";
import { prisma } from "../prisma";

/**
 * Who may do what in the admin panel.
 *
 * The Super Admin decides this from the Roles page, per role and — where one
 * person needs an exception — per user. Every module has three switches:
 *
 *  - view:   open the page and read what is there
 *  - edit:   create and change things
 *  - delete: remove things
 *
 * The Super Admin always has everything and cannot be restricted, so the panel
 * can never lock out the one account able to undo a mistake. Users & Roles,
 * approvals and the team page are Super Admin only and are not modules here.
 *
 * Enforcement is on the server (middleware/permissions.ts); the panel only
 * hides what the server would refuse anyway.
 */

export const MODULES = [
  "dashboard",
  "articles",
  "categories",
  "breaking",
  "homepage",
  "liveTv",
  "media",
  "epaper",
  "lawyers",
  "donors",
  "hospitals",
  "newsletter",
  "ads",
  "comments",
  "seo",
  "settings",
] as const;

export type Module = (typeof MODULES)[number];
export type Action = "view" | "edit" | "delete";

export interface Perm {
  view: boolean;
  edit: boolean;
  delete: boolean;
}
export type PermSet = Record<Module, Perm>;

export const MODULE_GROUPS: Record<Module, "content" | "directory" | "site"> = {
  dashboard: "site",
  articles: "content",
  categories: "content",
  breaking: "content",
  homepage: "content",
  liveTv: "content",
  media: "content",
  epaper: "content",
  lawyers: "directory",
  donors: "directory",
  hospitals: "directory",
  newsletter: "site",
  ads: "site",
  comments: "content",
  seo: "site",
  settings: "site",
};

/** The roles whose permissions the Super Admin can edit. */
export const EDITABLE_ROLES = ["ADMIN", "EDITOR", "REPORTER", "MODERATOR"] as const;

export function isModule(m: string): m is Module {
  return (MODULES as readonly string[]).includes(m);
}

const NONE: Perm = { view: false, edit: false, delete: false };
const ALL: Perm = { view: true, edit: true, delete: true };
const VIEW_EDIT: Perm = { view: true, edit: true, delete: false };

/**
 * What each role starts with before the Super Admin changes anything — the
 * same access the fixed role lists used to give, so turning this system on
 * changes nobody's access until someone decides it should.
 */
const DEFAULTS: Record<(typeof EDITABLE_ROLES)[number], Partial<PermSet>> = {
  ADMIN: Object.fromEntries(MODULES.map((m) => [m, ALL])) as PermSet,
  EDITOR: {
    dashboard: { view: true, edit: false, delete: false },
    articles: ALL,
    categories: VIEW_EDIT,
    breaking: ALL,
    media: ALL,
    epaper: ALL,
    comments: ALL,
  },
  REPORTER: {
    articles: VIEW_EDIT,
    media: VIEW_EDIT,
  },
  MODERATOR: {
    lawyers: ALL,
    donors: ALL,
    hospitals: ALL,
    comments: ALL,
  },
};

export function defaultPerm(role: string, module: Module): Perm {
  if (role === "SUPER_ADMIN") return ALL;
  const d = DEFAULTS[role as keyof typeof DEFAULTS];
  return { ...(d?.[module] ?? NONE) };
}

/**
 * Keeps the three switches consistent: you cannot edit or delete what you are
 * not allowed to see, so either of those turns view on, and turning view off
 * turns them off.
 */
export function normalize(p: Perm, changed?: Action): Perm {
  const out = { ...p };
  if (changed === "view" && !out.view) {
    out.edit = false;
    out.delete = false;
  }
  if (out.edit || out.delete) out.view = true;
  return out;
}

// --- cache ---
// One API process, so a plain in-memory cache is exact: every write below
// clears it.

let roleCache: Map<string, PermSet> | null = null;
const userCache = new Map<string, Partial<PermSet>>();

export function clearPermissionCache(userId?: string) {
  if (userId) userCache.delete(userId);
  else {
    roleCache = null;
    userCache.clear();
  }
}

async function rolePerms(): Promise<Map<string, PermSet>> {
  if (roleCache) return roleCache;
  const rows = await prisma.rolePermission.findMany();
  const map = new Map<string, PermSet>();
  for (const role of EDITABLE_ROLES) {
    const set = {} as PermSet;
    for (const m of MODULES) set[m] = defaultPerm(role, m);
    map.set(role, set);
  }
  for (const r of rows) {
    if (!isModule(r.module)) continue;
    const set = map.get(r.role);
    if (set)
      set[r.module] = { view: r.canView, edit: r.canEdit, delete: r.canDelete };
  }
  roleCache = map;
  return map;
}

async function userOverrides(userId: string): Promise<Partial<PermSet>> {
  const hit = userCache.get(userId);
  if (hit) return hit;
  const rows = await prisma.userPermission.findMany({ where: { userId } });
  const out: Partial<PermSet> = {};
  for (const r of rows)
    if (isModule(r.module))
      out[r.module] = { view: r.canView, edit: r.canEdit, delete: r.canDelete };
  userCache.set(userId, out);
  return out;
}

/** A role's permissions, before any one person's exceptions. */
export async function permissionsForRole(role: string): Promise<PermSet> {
  if (role === "SUPER_ADMIN") return allPerms();
  const set = (await rolePerms()).get(role);
  return set ? clone(set) : noPerms();
}

/** What this person may actually do: their role, then their own exceptions. */
export async function effectivePermissions(user: {
  id: string;
  role: string;
}): Promise<PermSet> {
  if (user.role === "SUPER_ADMIN") return allPerms();
  const base = await permissionsForRole(user.role);
  const own = await userOverrides(user.id);
  for (const m of MODULES) if (own[m]) base[m] = { ...own[m]! };
  return base;
}

export async function userOverrideModules(userId: string): Promise<Module[]> {
  return Object.keys(await userOverrides(userId)) as Module[];
}

export async function can(
  user: { id: string; role: string },
  module: Module,
  action: Action,
): Promise<boolean> {
  if (user.role === "SUPER_ADMIN") return true;
  return (await effectivePermissions(user))[module][action];
}

export async function setRolePermission(role: Role, module: Module, p: Perm) {
  await prisma.rolePermission.upsert({
    where: { role_module: { role, module } },
    create: { role, module, canView: p.view, canEdit: p.edit, canDelete: p.delete },
    update: { canView: p.view, canEdit: p.edit, canDelete: p.delete },
  });
  clearPermissionCache();
}

/** Puts a role back to its starting permissions. */
export async function resetRole(role: Role) {
  await prisma.rolePermission.deleteMany({ where: { role } });
  clearPermissionCache();
}

export async function setUserPermission(userId: string, module: Module, p: Perm) {
  await prisma.userPermission.upsert({
    where: { userId_module: { userId, module } },
    create: { userId, module, canView: p.view, canEdit: p.edit, canDelete: p.delete },
    update: { canView: p.view, canEdit: p.edit, canDelete: p.delete },
  });
  clearPermissionCache(userId);
}

/** Drops one exception (or all of them), so the role's setting applies again. */
export async function clearUserPermission(userId: string, module?: Module) {
  await prisma.userPermission.deleteMany({
    where: { userId, ...(module ? { module } : {}) },
  });
  clearPermissionCache(userId);
}

function allPerms(): PermSet {
  return Object.fromEntries(MODULES.map((m) => [m, { ...ALL }])) as PermSet;
}
function noPerms(): PermSet {
  return Object.fromEntries(MODULES.map((m) => [m, { ...NONE }])) as PermSet;
}
function clone(s: PermSet): PermSet {
  return Object.fromEntries(MODULES.map((m) => [m, { ...s[m] }])) as PermSet;
}
