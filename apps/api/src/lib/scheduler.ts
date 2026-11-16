import { prisma } from "../prisma";
import { emitChange } from "../realtime";
import { clearOtherHeroes } from "./articles";
import { logWork, notifyStaff, notifySupers } from "./staffNotify";

/**
 * Puts SCHEDULED stories live once their time comes.
 *
 * A status of SCHEDULED used to be a dead end: nothing ever looked at it
 * again, so a scheduled story never reached the site. This checks every
 * thirty seconds, which is as close to the minute an editor picks as a news
 * site needs, and once at start-up so stories that fell due while the API was
 * down go out straight away.
 *
 * publishedAt is the moment the story actually went live, not the time asked
 * for: after downtime those differ, and the site must not claim a story was
 * out before it was.
 */
const EVERY_MS = 30 * 1000;
let running = false;

export function startScheduler() {
  void publishDue();
  setInterval(() => void publishDue(), EVERY_MS).unref();
}

export async function publishDue() {
  // A slow tick must not overlap the next one.
  if (running) return;
  running = true;
  try {
    const due = await prisma.article.findMany({
      where: { status: "SCHEDULED", scheduledAt: { lte: new Date() } },
      select: {
        id: true,
        title: true,
        authorId: true,
        isHero: true,
        reviewedById: true,
        author: { select: { role: true, name: true } },
      },
      orderBy: { scheduledAt: "asc" },
      take: 50,
    });

    let published = 0;
    for (const a of due) {
      // Conditional on the status, so an editor who unscheduled or published
      // it by hand a moment ago is not overridden.
      const { count } = await prisma.article.updateMany({
        where: { id: a.id, status: "SCHEDULED" },
        data: { status: "PUBLISHED", publishedAt: new Date() },
      });
      if (!count) continue;
      published++;
      if (a.isHero) await clearOtherHeroes(a.id);

      const href = `/admin/articles/${a.id}/edit`;
      await logWork({
        userId: a.authorId,
        action: "article_published_scheduled",
        entity: "article",
        entityId: a.id,
        detail: a.title,
      });
      await notifyStaff(a.authorId, { kind: "scheduled_published", title: a.title, href });
      // Scheduled by someone trusted to publish without approval: the Super
      // Admin hears about it when it goes live, as with any direct publish.
      if (!a.reviewedById && a.author.role !== "SUPER_ADMIN")
        await notifySupers({
          kind: "direct_published",
          title: `${a.author.name}: ${a.title}`,
          href,
        });
    }
    if (published) emitChange({ type: "article", scheduled: published });
  } catch (err) {
    console.error("[scheduler]", err);
  } finally {
    running = false;
  }
}
