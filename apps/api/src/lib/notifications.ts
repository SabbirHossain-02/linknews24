import { prisma } from "../prisma";

/**
 * What is waiting for someone in the newsroom to act on.
 *
 * Derived from the real rows every time it is asked for, rather than kept in a
 * table of its own. That means a notification cannot outlive the thing it is
 * about: approve a donor and it is gone from the bell on the next read, with
 * nothing to sweep up afterwards.
 */
export type NotificationKind =
  | "lawyer"
  | "donor"
  | "hospital"
  | "comment"
  | "ad";

export interface AdminNotification {
  id: string;
  kind: NotificationKind;
  /** Who or what it is about — a person's name, a hospital, an advertiser. */
  subject: string;
  /** Where to go to deal with it. */
  href: string;
  createdAt: string;
}

const TAKE = 12;

export async function listNotifications(): Promise<{
  items: AdminNotification[];
  counts: Record<NotificationKind, number>;
  total: number;
}> {
  const [lawyers, donors, hospitals, comments, ads, counts] = await Promise.all([
    prisma.lawyer.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: TAKE,
      select: { id: true, name: true, createdAt: true },
    }),
    prisma.bloodDonor.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: TAKE,
      select: { id: true, name: true, createdAt: true },
    }),
    prisma.hospital.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: TAKE,
      select: { id: true, name: true, createdAt: true },
    }),
    prisma.comment.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: TAKE,
      select: { id: true, name: true, createdAt: true },
    }),
    prisma.ad.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: TAKE,
      select: { id: true, name: true, createdAt: true },
    }),
    Promise.all([
      prisma.lawyer.count({ where: { status: "PENDING" } }),
      prisma.bloodDonor.count({ where: { status: "PENDING" } }),
      prisma.hospital.count({ where: { status: "PENDING" } }),
      prisma.comment.count({ where: { status: "PENDING" } }),
      prisma.ad.count({ where: { status: "PENDING" } }),
    ]),
  ]);

  const make = (
    kind: NotificationKind,
    href: string,
    rows: { id: string; name: string; createdAt: Date }[],
  ): AdminNotification[] =>
    rows.map((r) => ({
      id: `${kind}:${r.id}`,
      kind,
      subject: r.name,
      href,
      createdAt: r.createdAt.toISOString(),
    }));

  const items = [
    ...make("lawyer", "/admin/lawyers", lawyers),
    ...make("donor", "/admin/donors", donors),
    ...make("hospital", "/admin/hospitals", hospitals),
    ...make("comment", "/admin/comments", comments),
    ...make("ad", "/admin/ads", ads),
  ]
    // Newest first across all five kinds, so the bell reads as one feed.
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 20);

  const [lawyer, donor, hospital, comment, ad] = counts;
  return {
    items,
    counts: { lawyer, donor, hospital, comment, ad },
    total: lawyer + donor + hospital + comment + ad,
  };
}
