import { Router, type Request } from "express";
import { z } from "zod";
import type { Role } from "@prisma/client";
import { prisma } from "../prisma";
import { requireRole } from "../middleware/auth";
import { hashPassword } from "../lib/password";
import {
  EDITABLE_ROLES,
  MODULES,
  MODULE_GROUPS,
  clearUserPermission,
  defaultPerm,
  effectivePermissions,
  isModule,
  normalize,
  permissionsForRole,
  resetRole,
  setRolePermission,
  setUserPermission,
  type Module,
  type Perm,
  type PermSet,
} from "../lib/permissions";
import {
  articleSchema,
  categoryExists,
  clearOtherHeroes,
  contentFields,
} from "../lib/articles";
import { listNotifications } from "../lib/notifications";
import { logWork, notifyStaff } from "../lib/staffNotify";
import {
  emitToStaff,
  emitToSupers,
  emitToUser,
  presenceSnapshot,
  refreshUserRooms,
  revokeUser,
} from "../realtime";

/**
 * The newsroom's own management: who is on the staff and what each of them may
 * do, the Super Admin's approval queue, the team overview, and each person's
 * own notifications and figures.
 *
 * Mounted inside the admin router, so authentication and the permission gate
 * (middleware/permissions.ts) have already run. Everything here except /my/*
 * and /notifications is Super Admin only — said again on each route so it does
 * not rest on the gate alone.
 */
export const newsroomRouter = Router();
const superOnly = requireRole("SUPER_ADMIN");

const ROLES = ["SUPER_ADMIN", "ADMIN", "EDITOR", "REPORTER", "MODERATOR"] as const;

// ===================== USERS =====================

newsroomRouter.get("/users", superOnly, async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      active: true,
      lastSeenAt: true,
      createdAt: true,
      _count: { select: { permissions: true } },
    },
  });
  const online = new Set(presenceSnapshot().map((p) => p.userId));
  res.json({
    users: users.map(({ _count, ...u }) => ({
      ...u,
      online: online.has(u.id),
      customPermissions: _count.permissions,
    })),
  });
});

const userCreateSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  password: z.string().min(8),
  role: z.enum(ROLES),
});

newsroomRouter.post("/users", superOnly, async (req, res) => {
  const parsed = userCreateSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: "নাম, সঠিক ইমেইল ও কমপক্ষে ৮ অক্ষরের পাসওয়ার্ড দিন" });
  const exists = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (exists) return res.status(400).json({ error: "এই ইমেইল আগে থেকেই আছে" });
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: await hashPassword(parsed.data.password),
      role: parsed.data.role,
    },
    select: { id: true, name: true, email: true, role: true, active: true },
  });
  await logWork({
    userId: req.user!.id,
    action: "user_created",
    entity: "user",
    entityId: user.id,
    detail: `${user.name} (${user.role})`,
  });
  res.status(201).json({ user });
});

const userUpdateSchema = z.object({
  name: z.string().trim().min(1).optional(),
  role: z.enum(ROLES).optional(),
  active: z.boolean().optional(),
  password: z.string().min(8).optional(),
});

newsroomRouter.put("/users/:id", superOnly, async (req, res) => {
  const parsed = userUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
  const { id } = req.params;

  // The Super Admin cannot demote or switch off themselves — there may be no
  // one else left able to undo it.
  if (
    id === req.user!.id &&
    ((parsed.data.role && parsed.data.role !== "SUPER_ADMIN") ||
      parsed.data.active === false)
  )
    return res
      .status(400)
      .json({ error: "নিজের সুপার অ্যাডমিন অধিকার সরাতে পারবেন না" });

  const before = await prisma.user.findUnique({
    where: { id },
    select: { role: true, active: true },
  });
  if (!before) return res.status(404).json({ error: "Not found" });

  const data: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.password) data.password = await hashPassword(parsed.data.password);
  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, active: true },
  });

  if (!user.active) revokeUser(user.id);
  else if (user.role !== before.role) refreshUserRooms(user.id, user.role);

  if (user.role !== before.role || user.active !== before.active)
    await logWork({
      userId: req.user!.id,
      action: user.active ? "user_role_changed" : "user_deactivated",
      entity: "user",
      entityId: user.id,
      detail: `${user.name}: ${before.role} → ${user.role}`,
    });
  res.json({ user });
});

newsroomRouter.delete("/users/:id", superOnly, async (req, res) => {
  if (req.params.id === req.user!.id)
    return res.status(400).json({ error: "নিজেকে মুছতে পারবেন না" });
  const user = await prisma.user
    .delete({ where: { id: req.params.id }, select: { id: true, name: true } })
    .catch(() => null);
  // Someone with stories on the site cannot be deleted without deleting the
  // stories; switching them off keeps the byline and locks the door.
  if (!user)
    return res.status(409).json({
      error: "এই ইউজারের লেখা খবর আছে, তাই মোছা যাবে না — নিষ্ক্রিয় করে দিন",
    });
  revokeUser(user.id);
  await logWork({
    userId: req.user!.id,
    action: "user_deleted",
    entity: "user",
    entityId: user.id,
    detail: user.name,
  });
  res.json({ ok: true });
});

// ===================== PERMISSIONS =====================

const permChange = z.object({
  module: z.string(),
  view: z.boolean(),
  edit: z.boolean(),
  delete: z.boolean(),
  /** Which switch was flipped, so turning view off can take the others with it. */
  changed: z.enum(["view", "edit", "delete"]).optional(),
});
const permChanges = z.object({ changes: z.array(permChange).min(1).max(MODULES.length) });

function isEditableRole(r: string): r is (typeof EDITABLE_ROLES)[number] {
  return (EDITABLE_ROLES as readonly string[]).includes(r);
}

async function roleMatrix() {
  const matrix: Record<string, PermSet> = {};
  const defaults: Record<string, PermSet> = {};
  for (const r of EDITABLE_ROLES) {
    matrix[r] = await permissionsForRole(r);
    defaults[r] = Object.fromEntries(
      MODULES.map((m) => [m, defaultPerm(r, m)]),
    ) as PermSet;
  }
  const counts = await prisma.user.groupBy({ by: ["role"], _count: { _all: true } });
  return {
    modules: MODULES.map((m) => ({ key: m, group: MODULE_GROUPS[m] })),
    roles: EDITABLE_ROLES,
    matrix,
    defaults,
    userCounts: Object.fromEntries(counts.map((c) => [c.role, c._count._all])),
  };
}

newsroomRouter.get("/permissions", superOnly, async (_req, res) => {
  res.json(await roleMatrix());
});

newsroomRouter.put("/permissions/roles/:role", superOnly, async (req, res) => {
  const { role } = req.params;
  if (!isEditableRole(role)) return res.status(400).json({ error: "অজানা রোল" });
  const parsed = permChanges.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  for (const c of parsed.data.changes) {
    if (!isModule(c.module)) continue;
    await setRolePermission(role as Role, c.module, normalize(c, c.changed));
  }
  await logWork({
    userId: req.user!.id,
    action: "permissions_changed",
    entity: "role",
    entityId: role,
    detail: parsed.data.changes.map((c) => c.module).join(", "),
  });
  // Everyone's open panel re-reads what it may show, at once.
  emitToStaff("permissions:changed", { role });
  res.json(await roleMatrix());
});

newsroomRouter.post("/permissions/roles/:role/reset", superOnly, async (req, res) => {
  const { role } = req.params;
  if (!isEditableRole(role)) return res.status(400).json({ error: "অজানা রোল" });
  await resetRole(role as Role);
  await logWork({
    userId: req.user!.id,
    action: "permissions_reset",
    entity: "role",
    entityId: role,
  });
  emitToStaff("permissions:changed", { role });
  res.json(await roleMatrix());
});

async function userPermissionView(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true },
  });
  if (!user) return null;
  const rolePerms = await permissionsForRole(user.role);
  const rows = await prisma.userPermission.findMany({ where: { userId } });
  const overrides: Partial<PermSet> = {};
  for (const r of rows)
    if (isModule(r.module))
      overrides[r.module] = { view: r.canView, edit: r.canEdit, delete: r.canDelete };
  return {
    user,
    modules: MODULES.map((m) => ({ key: m, group: MODULE_GROUPS[m] })),
    role: rolePerms,
    overrides,
    effective: await effectivePermissions(user),
  };
}

newsroomRouter.get("/users/:id/permissions", superOnly, async (req, res) => {
  const view = await userPermissionView(req.params.id);
  if (!view) return res.status(404).json({ error: "Not found" });
  res.json(view);
});

const same = (a: Perm, b: Perm) =>
  a.view === b.view && a.edit === b.edit && a.delete === b.delete;

newsroomRouter.put("/users/:id/permissions", superOnly, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true, name: true, role: true },
  });
  if (!user) return res.status(404).json({ error: "Not found" });
  if (user.role === "SUPER_ADMIN")
    return res.status(400).json({ error: "সুপার অ্যাডমিনের সব অনুমতি সবসময় থাকে" });
  const parsed = permChanges.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const rolePerms = await permissionsForRole(user.role);
  for (const c of parsed.data.changes) {
    if (!isModule(c.module)) continue;
    const p = normalize(c, c.changed);
    // Matching the role again is not an exception any more — drop it, so the
    // person goes back to following their role.
    if (same(p, rolePerms[c.module])) await clearUserPermission(user.id, c.module);
    else await setUserPermission(user.id, c.module, p);
  }
  await logWork({
    userId: req.user!.id,
    action: "permissions_changed",
    entity: "user",
    entityId: user.id,
    detail: `${user.name}: ${parsed.data.changes.map((c) => c.module).join(", ")}`,
  });
  emitToUser(user.id, "permissions:changed");
  res.json(await userPermissionView(user.id));
});

/** Back to the role's permissions — for one module, or (no ?module) all of them. */
newsroomRouter.delete("/users/:id/permissions", superOnly, async (req, res) => {
  const module = req.query.module as string | undefined;
  if (module && !isModule(module)) return res.status(400).json({ error: "Invalid module" });
  await clearUserPermission(req.params.id, module as Module | undefined);
  emitToUser(req.params.id, "permissions:changed");
  const view = await userPermissionView(req.params.id);
  if (!view) return res.status(404).json({ error: "Not found" });
  res.json(view);
});

// ===================== APPROVALS =====================

const reasonSchema = z.object({ reason: z.string().trim().max(1000).optional() });
const ALREADY_DECIDED = "এই খবরের সিদ্ধান্ত আগেই নেওয়া হয়েছে";

const authorSelect = { select: { id: true, name: true, role: true, avatar: true } };

/** Everything waiting for the Super Admin, oldest first — first come, first served. */
newsroomRouter.get("/approvals", superOnly, async (_req, res) => {
  const [articles, revisions, decidedArticles, decidedRevisions] = await Promise.all([
    prisma.article.findMany({
      where: { status: "PENDING" },
      orderBy: [{ submittedAt: "asc" }, { createdAt: "asc" }],
      omit: { body: true, bodyEn: true },
      include: {
        author: authorSelect,
        category: { select: { name: true, nameEn: true } },
      },
    }),
    prisma.articleRevision.findMany({
      where: { status: "PENDING" },
      orderBy: { updatedAt: "asc" },
      include: {
        author: authorSelect,
        article: {
          select: {
            id: true,
            title: true,
            slug: true,
            featuredImage: true,
            category: { select: { name: true, nameEn: true } },
          },
        },
      },
    }),
    prisma.article.findMany({
      where: { reviewedAt: { not: null } },
      orderBy: { reviewedAt: "desc" },
      take: 15,
      select: {
        id: true,
        title: true,
        status: true,
        reviewNote: true,
        reviewedAt: true,
        author: { select: { name: true } },
      },
    }),
    prisma.articleRevision.findMany({
      where: { status: { not: "PENDING" } },
      orderBy: { reviewedAt: "desc" },
      take: 15,
      select: {
        id: true,
        status: true,
        reviewNote: true,
        reviewedAt: true,
        author: { select: { name: true } },
        article: { select: { id: true, title: true } },
      },
    }),
  ]);

  res.json({
    articles,
    // The list needs what changed in outline, not two full bodies per row.
    revisions: revisions.map((r) => {
      const d = (r.data ?? {}) as Record<string, unknown>;
      return {
        ...r,
        data: {
          title: d.title,
          excerpt: d.excerpt,
          featuredImage: d.featuredImage,
        },
      };
    }),
    history: [
      ...decidedArticles.map((a) => ({
        id: a.id,
        type: "article" as const,
        articleId: a.id,
        title: a.title,
        status: a.status,
        reviewNote: a.reviewNote,
        reviewedAt: a.reviewedAt,
        author: a.author.name,
      })),
      ...decidedRevisions.map((r) => ({
        id: r.id,
        type: "revision" as const,
        articleId: r.article.id,
        title: r.article.title,
        status: r.status,
        reviewNote: r.reviewNote,
        reviewedAt: r.reviewedAt,
        author: r.author.name,
      })),
    ]
      .sort((a, b) => (b.reviewedAt?.getTime() ?? 0) - (a.reviewedAt?.getTime() ?? 0))
      .slice(0, 20),
  });
});

/** One proposed edit beside the live version, for the comparison view. */
newsroomRouter.get("/approvals/revisions/:id", superOnly, async (req, res) => {
  const revision = await prisma.articleRevision.findUnique({
    where: { id: req.params.id },
    include: {
      author: authorSelect,
      article: {
        include: {
          category: { select: { id: true, name: true, nameEn: true } },
          tags: { select: { name: true } },
        },
      },
    },
  });
  if (!revision) return res.status(404).json({ error: "Not found" });
  const proposedCategory =
    typeof (revision.data as Record<string, unknown>)?.categoryId === "string"
      ? await prisma.category.findUnique({
          where: { id: (revision.data as { categoryId: string }).categoryId },
          select: { id: true, name: true, nameEn: true },
        })
      : null;
  res.json({ revision, proposedCategory });
});

async function decideArticle(
  req: Request,
  decision: "PUBLISHED" | "REJECTED" | "DRAFT",
) {
  const parsed = reasonSchema.safeParse(req.body ?? {});
  const reason = parsed.success ? parsed.data.reason || null : null;
  const me = req.user!.id;

  const a = await prisma.article.findUnique({ where: { id: req.params.id } });
  if (!a) return { status: 404, body: { error: "Not found" } };
  if (a.status !== "PENDING") return { status: 409, body: { error: ALREADY_DECIDED } };

  const article = await prisma.article.update({
    where: { id: a.id },
    data: {
      status: decision,
      publishedAt: decision === "PUBLISHED" ? a.publishedAt ?? new Date() : null,
      reviewNote: decision === "PUBLISHED" ? null : reason,
      reviewedById: me,
      reviewedAt: new Date(),
    },
  });
  if (decision === "PUBLISHED" && article.isHero) await clearOtherHeroes(article.id);

  const kind =
    decision === "PUBLISHED"
      ? "article_approved"
      : decision === "REJECTED"
        ? "article_rejected"
        : "article_drafted";
  await logWork({ userId: me, action: kind, entity: "article", entityId: a.id, detail: a.title });
  if (a.authorId !== me)
    await notifyStaff(a.authorId, {
      kind,
      title: a.title,
      message: reason,
      href: `/admin/articles/${a.id}/edit`,
    });
  emitToSupers("approvals:changed");
  return { status: 200, body: { article } };
}

newsroomRouter.post("/approvals/articles/:id/approve", superOnly, async (req, res) => {
  const r = await decideArticle(req, "PUBLISHED");
  res.status(r.status).json(r.body);
});
newsroomRouter.post("/approvals/articles/:id/reject", superOnly, async (req, res) => {
  const r = await decideArticle(req, "REJECTED");
  res.status(r.status).json(r.body);
});
newsroomRouter.post("/approvals/articles/:id/draft", superOnly, async (req, res) => {
  const r = await decideArticle(req, "DRAFT");
  res.status(r.status).json(r.body);
});

newsroomRouter.post("/approvals/revisions/:id/approve", superOnly, async (req, res) => {
  const me = req.user!.id;
  const r = await prisma.articleRevision.findUnique({
    where: { id: req.params.id },
    include: { article: { select: { id: true, slug: true, title: true } } },
  });
  if (!r) return res.status(404).json({ error: "Not found" });
  if (r.status !== "PENDING") return res.status(409).json({ error: ALREADY_DECIDED });

  const parsed = articleSchema.safeParse(r.data);
  if (!parsed.success)
    return res.status(400).json({ error: "সংশোধনের তথ্য ঠিক নেই" });
  if (!(await categoryExists(parsed.data.categoryId)))
    return res.status(400).json({ error: "সংশোধনের ক্যাটাগরি আর নেই" });

  const fields = await contentFields(parsed.data, r.article);
  const [article] = await prisma.$transaction([
    prisma.article.update({
      where: { id: r.article.id },
      data: { ...fields, editedAt: new Date() },
    }),
    prisma.articleRevision.update({
      where: { id: r.id },
      data: { status: "APPROVED", reviewedById: me, reviewedAt: new Date(), reviewNote: null },
    }),
  ]);
  if (article.isHero && article.status === "PUBLISHED") await clearOtherHeroes(article.id);

  await logWork({
    userId: me,
    action: "revision_approved",
    entity: "article",
    entityId: article.id,
    detail: article.title,
  });
  if (r.authorId !== me)
    await notifyStaff(r.authorId, {
      kind: "revision_approved",
      title: article.title,
      href: `/admin/articles/${article.id}/edit`,
    });
  emitToSupers("approvals:changed");
  res.json({ article });
});

newsroomRouter.post("/approvals/revisions/:id/reject", superOnly, async (req, res) => {
  const me = req.user!.id;
  const parsed = reasonSchema.safeParse(req.body ?? {});
  const reason = parsed.success ? parsed.data.reason || null : null;
  const r = await prisma.articleRevision.findUnique({
    where: { id: req.params.id },
    include: { article: { select: { id: true, title: true } } },
  });
  if (!r) return res.status(404).json({ error: "Not found" });
  if (r.status !== "PENDING") return res.status(409).json({ error: ALREADY_DECIDED });

  await prisma.articleRevision.update({
    where: { id: r.id },
    data: { status: "REJECTED", reviewedById: me, reviewedAt: new Date(), reviewNote: reason },
  });
  await logWork({
    userId: me,
    action: "revision_rejected",
    entity: "article",
    entityId: r.article.id,
    detail: r.article.title,
  });
  if (r.authorId !== me)
    await notifyStaff(r.authorId, {
      kind: "revision_rejected",
      title: r.article.title,
      message: reason,
      href: `/admin/articles/${r.article.id}/edit`,
    });
  emitToSupers("approvals:changed");
  res.json({ ok: true });
});

// ===================== TEAM =====================

/** Midnight in Dhaka, as an instant — "today" for a Bangladeshi newsroom. */
function startOfDhakaDay(now = Date.now()) {
  const SIX_H = 6 * 3600 * 1000;
  const DAY = 24 * 3600 * 1000;
  return new Date(Math.floor((now + SIX_H) / DAY) * DAY - SIX_H);
}

const WORK_ACTIONS_EXCLUDED = ["login_failed", "login_locked"];

newsroomRouter.get("/team", superOnly, async (_req, res) => {
  const today = startOfDhakaDay();
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);

  const [users, byStatus, todayCounts, weekCounts, openRevisions, lastActs, activity] =
    await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          active: true,
          lastSeenAt: true,
        },
      }),
      prisma.article.groupBy({ by: ["authorId", "status"], _count: { _all: true } }),
      prisma.article.groupBy({
        by: ["authorId"],
        where: { createdAt: { gte: today } },
        _count: { _all: true },
      }),
      prisma.article.groupBy({
        by: ["authorId"],
        where: { createdAt: { gte: weekAgo } },
        _count: { _all: true },
      }),
      prisma.articleRevision.groupBy({
        by: ["authorId"],
        where: { status: "PENDING" },
        _count: { _all: true },
      }),
      prisma.activityLog.findMany({
        where: {
          userId: { not: null },
          action: { notIn: [...WORK_ACTIONS_EXCLUDED, "login", "logout"] },
        },
        orderBy: { createdAt: "desc" },
        distinct: ["userId"],
        select: { userId: true, action: true, detail: true, createdAt: true },
      }),
      prisma.activityLog.findMany({
        where: { userId: { not: null }, action: { notIn: WORK_ACTIONS_EXCLUDED } },
        orderBy: { createdAt: "desc" },
        take: 60,
        select: {
          id: true,
          action: true,
          entity: true,
          entityId: true,
          detail: true,
          createdAt: true,
          user: { select: { id: true, name: true, role: true } },
        },
      }),
    ]);

  const count = (rows: { authorId: string; _count: { _all: number } }[], id: string) =>
    rows.find((r) => r.authorId === id)?._count._all ?? 0;
  const online = presenceSnapshot();

  res.json({
    online,
    members: users.map((u) => {
      const mine = byStatus.filter((r) => r.authorId === u.id);
      const of = (s: string) => mine.find((r) => r.status === s)?._count._all ?? 0;
      return {
        ...u,
        online: online.some((o) => o.userId === u.id),
        lastActivity: lastActs.find((a) => a.userId === u.id) ?? null,
        stats: {
          total: mine.reduce((n, r) => n + r._count._all, 0),
          published: of("PUBLISHED"),
          pending: of("PENDING"),
          rejected: of("REJECTED"),
          drafts: of("DRAFT"),
          revisionsPending: count(openRevisions, u.id),
          today: count(todayCounts, u.id),
          week: count(weekCounts, u.id),
        },
      };
    }),
    activity,
  });
});

// ===================== MY OWN =====================

newsroomRouter.get("/my/stats", async (req, res) => {
  const me = req.user!.id;
  const [byStatus, revisions, recent, today] = await Promise.all([
    prisma.article.groupBy({
      by: ["status"],
      where: { authorId: me },
      _count: { _all: true },
    }),
    prisma.articleRevision.groupBy({
      by: ["status"],
      where: { authorId: me },
      _count: { _all: true },
    }),
    prisma.article.findMany({
      where: { authorId: me },
      orderBy: { updatedAt: "desc" },
      take: 8,
      select: {
        id: true,
        title: true,
        status: true,
        reviewNote: true,
        submittedAt: true,
        publishedAt: true,
        updatedAt: true,
      },
    }),
    prisma.article.count({ where: { authorId: me, createdAt: { gte: startOfDhakaDay() } } }),
  ]);
  const of = (s: string) => byStatus.find((r) => r.status === s)?._count._all ?? 0;
  res.json({
    stats: {
      total: byStatus.reduce((n, r) => n + r._count._all, 0),
      published: of("PUBLISHED"),
      pending: of("PENDING"),
      rejected: of("REJECTED"),
      drafts: of("DRAFT"),
      revisionsPending: revisions.find((r) => r.status === "PENDING")?._count._all ?? 0,
      today,
    },
    recent,
  });
});

newsroomRouter.get("/my/notifications", async (req, res) => {
  const [items, unread] = await Promise.all([
    prisma.staffNotification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.staffNotification.count({ where: { userId: req.user!.id, read: false } }),
  ]);
  res.json({ items, unread });
});

newsroomRouter.post("/my/notifications/read", async (req, res) => {
  const ids = z.object({ ids: z.array(z.string()).optional() }).safeParse(req.body ?? {});
  await prisma.staffNotification.updateMany({
    where: {
      userId: req.user!.id,
      read: false,
      ...(ids.success && ids.data.ids ? { id: { in: ids.data.ids } } : {}),
    },
    data: { read: true },
  });
  res.json({ ok: true });
});

/**
 * The bell's "waiting for a decision" list — only the kinds of work this person
 * may act on, and for the Super Admin the approval queue as well.
 */
newsroomRouter.get("/notifications", async (req, res) => {
  const perms = await effectivePermissions(req.user!);
  res.json(
    await listNotifications({
      lawyer: perms.lawyers.view,
      donor: perms.donors.view,
      hospital: perms.hospitals.view,
      comment: perms.comments.view,
      ad: perms.ads.view,
      approvals: req.user!.role === "SUPER_ADMIN",
    }),
  );
});
