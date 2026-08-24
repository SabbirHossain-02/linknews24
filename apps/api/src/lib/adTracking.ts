import { prisma } from "../prisma";

/**
 * Counting ad impressions honestly.
 *
 * An impression used to be recorded the moment the banner was put on the page,
 * whether or not anyone ever scrolled far enough to see it. That number is not
 * something you can hand an advertiser: it is what was *sent*, not what was
 * *seen*. The browser decides what was seen (see AdSlot's IntersectionObserver
 * — half the banner on screen for a full second); this file decides what is
 * worth recording once it arrives.
 */

/** Crawlers load pages but do not look at advertising. */
const BOT = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora link preview|whatsapp|telegram|preview|scrapy|headless|python-requests|curl|wget|axios|node-fetch|lighthouse|pagespeed|gtmetrix|pingdom|uptime/i;

export function isBot(userAgent: string | undefined): boolean {
  if (!userAgent || userAgent.trim().length < 10) return true;
  return BOT.test(userAgent);
}

/**
 * How long the same reader's second look at the same ad is ignored.
 *
 * Half an hour for impressions: refreshing the homepage four times in a row is
 * one person seeing one banner, not four impressions. A few seconds for clicks,
 * which only guards against a double click or a retried request — a reader who
 * genuinely comes back and clicks again tomorrow is a real second click.
 */
const IMPRESSION_WINDOW_MS = 30 * 60 * 1000;
const CLICK_WINDOW_MS = 10 * 1000;

export type AdEventType = "IMPRESSION" | "CLICK";

/**
 * Records one ad event, unless it is a bot or a repeat inside the window.
 * Returns whether it counted, so the caller knows if anything changed.
 */
export async function recordAdEvent({
  adId,
  type,
  ip,
  path,
  userAgent,
}: {
  adId: string;
  type: AdEventType;
  ip: string | null;
  path: string | null;
  userAgent: string | undefined;
}): Promise<boolean> {
  if (isBot(userAgent)) return false;

  // The ad has to exist, or the event row would be orphaned.
  const ad = await prisma.ad.findUnique({ where: { id: adId }, select: { id: true } });
  if (!ad) return false;

  const window = type === "IMPRESSION" ? IMPRESSION_WINDOW_MS : CLICK_WINDOW_MS;
  if (ip) {
    const recent = await prisma.adEvent.findFirst({
      where: {
        adId,
        type,
        ip,
        createdAt: { gt: new Date(Date.now() - window) },
      },
      select: { id: true },
    });
    if (recent) return false;
  }

  await prisma.$transaction([
    prisma.adEvent.create({ data: { adId, type, ip, path } }),
    prisma.ad.update({
      where: { id: adId },
      data:
        type === "IMPRESSION"
          ? { impressions: { increment: 1 } }
          : { clicks: { increment: 1 } },
    }),
  ]);
  return true;
}

/**
 * Day-by-day impressions and clicks for the last `days` days, per ad and in
 * total. This is what an advertiser is shown at the end of a booking.
 */
export async function adReport(days: number) {
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  from.setDate(from.getDate() - (days - 1));

  const [ads, events] = await Promise.all([
    prisma.ad.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        placement: true,
        status: true,
        impressions: true,
        clicks: true,
        startsAt: true,
        endsAt: true,
      },
    }),
    prisma.adEvent.findMany({
      where: { createdAt: { gte: from } },
      select: { adId: true, type: true, createdAt: true },
    }),
  ]);

  // One bucket per day, so a day with no traffic still shows as zero.
  const dayKeys: string[] = [];
  for (let i = 0; i < days; i += 1) {
    const d = new Date(from);
    d.setDate(from.getDate() + i);
    dayKeys.push(d.toISOString().slice(0, 10));
  }

  const blank = () =>
    Object.fromEntries(dayKeys.map((k) => [k, { impressions: 0, clicks: 0 }]));

  const totals = blank();
  const perAd = new Map<string, ReturnType<typeof blank>>();

  for (const e of events) {
    const key = e.createdAt.toISOString().slice(0, 10);
    if (!totals[key]) continue;
    const field = e.type === "IMPRESSION" ? "impressions" : "clicks";
    totals[key][field] += 1;
    if (!perAd.has(e.adId)) perAd.set(e.adId, blank());
    perAd.get(e.adId)![key][field] += 1;
  }

  const asSeries = (buckets: ReturnType<typeof blank>) =>
    dayKeys.map((day) => ({ day, ...buckets[day] }));

  return {
    days: dayKeys,
    totals: asSeries(totals),
    ads: ads.map((a) => {
      const series = asSeries(perAd.get(a.id) ?? blank());
      const impressions = series.reduce((s, d) => s + d.impressions, 0);
      const clicks = series.reduce((s, d) => s + d.clicks, 0);
      return {
        ...a,
        // Lifetime counters stay on the ad; these are for the window asked for.
        periodImpressions: impressions,
        periodClicks: clicks,
        series,
      };
    }),
  };
}
