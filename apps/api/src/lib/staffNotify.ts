import { prisma } from "../prisma";
import { emitToUser } from "../realtime";

/**
 * A personal message for one staff member, kept until they read it and pushed
 * to their open panel at once — "your story was rejected" should not wait for
 * a page reload.
 */
export type StaffNotificationKind =
  | "article_approved"
  | "article_rejected"
  | "article_drafted"
  | "revision_approved"
  | "revision_rejected"
  | "permissions_changed";

export async function notifyStaff(
  userId: string,
  n: { kind: StaffNotificationKind; title: string; message?: string | null; href?: string | null },
) {
  const row = await prisma.staffNotification
    .create({
      data: {
        userId,
        kind: n.kind,
        title: n.title.slice(0, 300),
        message: n.message?.slice(0, 1000) ?? null,
        href: n.href ?? null,
      },
    })
    .catch(() => null);
  if (row) emitToUser(userId, "notification:new", row);
}

/**
 * What a staff member did, for the team page's activity feed. Shares the
 * ActivityLog table with sign-ins; never allowed to break the request it is
 * recording.
 */
export async function logWork(entry: {
  userId: string;
  action: string;
  entity?: string;
  entityId?: string | null;
  detail?: string | null;
}) {
  await prisma.activityLog
    .create({
      data: {
        userId: entry.userId,
        action: entry.action,
        entity: entry.entity ?? null,
        entityId: entry.entityId ?? null,
        detail: entry.detail?.slice(0, 200) ?? null,
      },
    })
    .catch(() => null);
}
