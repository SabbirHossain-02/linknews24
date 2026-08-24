import { prisma } from "../prisma";

/**
 * Writes down who did what, and from where.
 *
 * The point is being able to answer "did anyone get in?" after the fact. A
 * failed sign-in on its own is nothing — everyone mistypes a password — but
 * forty of them from one address at three in the morning is a break-in
 * attempt, and without a record there is no way to know it happened.
 *
 * Never allowed to fail loudly: an audit write must not be the reason a sign-in
 * breaks.
 */
export type AuditAction =
  | "login"
  | "login_failed"
  | "login_locked"
  | "logout"
  | "password_changed"
  | "email_changed";

export async function audit(entry: {
  action: AuditAction;
  userId?: string | null;
  /** The address that was tried, when no account matched it. */
  detail?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  success?: boolean;
}) {
  await prisma.activityLog
    .create({
      data: {
        action: entry.action,
        userId: entry.userId ?? null,
        detail: entry.detail?.slice(0, 200) ?? null,
        ip: entry.ip ?? null,
        userAgent: entry.userAgent?.slice(0, 200) ?? null,
        success: entry.success ?? true,
      },
    })
    .catch(() => null);
}

/** The most recent sign-in activity, newest first. */
export async function recentLogins(take = 50) {
  return prisma.activityLog.findMany({
    where: { action: { in: ["login", "login_failed", "login_locked"] } },
    orderBy: { createdAt: "desc" },
    take: Math.min(take, 200),
    select: {
      id: true,
      action: true,
      detail: true,
      ip: true,
      userAgent: true,
      success: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
    },
  });
}
