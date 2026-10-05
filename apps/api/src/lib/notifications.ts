import { prisma } from "../prisma";

/**
 * What is waiting for someone in the newsroom to act on.
 *
 * Derived from the real rows every time it is asked for, rather than kept in a
 * table of its own. That means a notification cannot outlive the thing it is
 * about: approve a donor and it is gone from the bell on the next read, with
 * nothing to sweep up afterwards.
 *
 * Each person only hears about the kinds of work they are allowed to open, and
 * only the Super Admin hears about stories waiting for approval.
 */
export type NotificationKind =
  | "lawyer"
  | "donor"
  | "hospital"
  | "comment"
  | "ad"
  | "article"
  | "revision";

export interface AdminNotification {
  id: string;
  kind: NotificationKind;
  /** Who or what it is about — a person's name, a hospital, an advertiser. */
  subject: string;
  /** Where to go to deal with it. */
  href: string;
  createdAt: string;
}

export interface NotificationScope {
  lawyer: boolean;
  donor: boolean;
  hospital: boolean;
  comment: boolean;
  ad: boolean;
  approvals: boolean;
}

const TAKE = 12;

type Row = { id: string; name: string; createdAt: Date };

export async function listNotifications(scope: NotificationScope): Promise<{
  items: AdminNotification[];
  counts: Record<NotificationKind, number>;
  total: number;
}> {
  const pending = { status: "PENDING" as const };
  const recent = { orderBy: { createdAt: "desc" as const }, take: TAKE };
  const none = Promise.resolve([] as Row[]);
  const zero = Promise.resolve(0);

  const [lawyers, donors, hospitals, comments, ads, articles, revisions, counts] =
    await Promise.all([
      scope.lawyer
        ? prisma.lawyer.findMany({ where: pending, ...recent, select: { id: true, name: true, createdAt: true } })
        : none,
      scope.donor
        ? prisma.bloodDonor.findMany({ where: pending, ...recent, select: { id: true, name: true, createdAt: true } })
        : none,
      scope.hospital
        ? prisma.hospital.findMany({ where: pending, ...recent, select: { id: true, name: true, createdAt: true } })
        : none,
      scope.comment
        ? prisma.comment.findMany({ where: pending, ...recent, select: { id: true, name: true, createdAt: true } })
        : none,
      scope.ad
        ? prisma.ad.findMany({ where: pending, ...recent, select: { id: true, name: true, createdAt: true } })
        : none,
      scope.approvals
        ? prisma.article
            .findMany({
              where: pending,
              orderBy: { submittedAt: "desc" },
              take: TAKE,
              select: { id: true, title: true, submittedAt: true, createdAt: true },
            })
            .then((rows) =>
              rows.map((a) => ({ id: a.id, name: a.title, createdAt: a.submittedAt ?? a.createdAt })),
            )
        : none,
      scope.approvals
        ? prisma.articleRevision
            .findMany({
              where: pending,
              orderBy: { updatedAt: "desc" },
              take: TAKE,
              select: { id: true, updatedAt: true, article: { select: { title: true } } },
            })
            .then((rows) =>
              rows.map((r) => ({ id: r.id, name: r.article.title, createdAt: r.updatedAt })),
            )
        : none,
      Promise.all([
        scope.lawyer ? prisma.lawyer.count({ where: pending }) : zero,
        scope.donor ? prisma.bloodDonor.count({ where: pending }) : zero,
        scope.hospital ? prisma.hospital.count({ where: pending }) : zero,
        scope.comment ? prisma.comment.count({ where: pending }) : zero,
        scope.ad ? prisma.ad.count({ where: pending }) : zero,
        scope.approvals ? prisma.article.count({ where: pending }) : zero,
        scope.approvals ? prisma.articleRevision.count({ where: pending }) : zero,
      ]),
    ]);

  const make = (kind: NotificationKind, href: string, rows: Row[]): AdminNotification[] =>
    rows.map((r) => ({
      id: `${kind}:${r.id}`,
      kind,
      subject: r.name,
      href,
      createdAt: r.createdAt.toISOString(),
    }));

  const items = [
    ...make("article", "/admin/approvals", articles),
    ...make("revision", "/admin/approvals", revisions),
    ...make("lawyer", "/admin/lawyers", lawyers),
    ...make("donor", "/admin/donors", donors),
    ...make("hospital", "/admin/hospitals", hospitals),
    ...make("comment", "/admin/comments", comments),
    ...make("ad", "/admin/ads", ads),
  ]
    // Newest first across every kind, so the bell reads as one feed.
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 20);

  const [lawyer, donor, hospital, comment, ad, article, revision] = counts;
  return {
    items,
    counts: { lawyer, donor, hospital, comment, ad, article, revision },
    total: lawyer + donor + hospital + comment + ad + article + revision,
  };
}
