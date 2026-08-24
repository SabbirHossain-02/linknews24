import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { disallowList, getSeo } from "@/lib/seo";

// Re-read hourly, so a change on the SEO page reaches crawlers without a deploy.
export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getSeo();

  // "Not indexable" means exactly that: nothing is crawlable, and no sitemap is
  // advertised. Anything less would leave the site half-listed.
  if (!seo.indexable) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: disallowList(seo.robotsDisallow),
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
