import { apiGet } from "@/lib/api";
import { DEFAULT_SHARE_IMAGE, getSeo } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

/**
 * Who publishes this site, for search engines (schema.org JSON-LD).
 *
 * Without it Google had nothing tying the name "LinkNews24" to this domain,
 * so the homepage did not come first even for a search for the brand itself.
 * Two linked entities, on every page:
 *
 * - NewsMediaOrganization: the name, the names people also use, the logo and
 *   the brand's social accounts (sameAs).
 * - WebSite: the site name Google shows above results (name + alternateName),
 *   and the site's own search box (SearchAction → /search?q=…).
 *
 * Everything comes from what the admin already maintains — the SEO page
 * (organisation name and logo) and Settings (social links) — so a change
 * there reaches search engines without a deploy, and nothing is invented: a
 * social network with no link set is simply not listed.
 */

/** The same brand, as people type it. Google uses these for the site name. */
const ALTERNATE_NAMES = ["Link News 24", "লিংক নিউজ ২৪"];

interface SiteSettings {
  logoUrl?: string;
  socials?: { platform?: string; url?: string }[];
}

/**
 * A profile URL as it should be cited: tracking and view parameters dropped
 * (a Facebook link copied from the reels tab carries `&sk=reels_tab`).
 */
function cleanProfileUrl(raw: string): string | null {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  for (const key of [...u.searchParams.keys()]) {
    if (key === "sk" || key === "ref" || key === "fbclid" || key === "si" || key.startsWith("utm_"))
      u.searchParams.delete(key);
  }
  u.hash = "";
  return u.toString();
}

/**
 * JSON for a <script> body. `<` is escaped so that text typed in the admin
 * (say an organisation name containing "</script>") cannot end the tag.
 */
function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export async function SiteSchema() {
  const [seo, site] = await Promise.all([
    getSeo(),
    apiGet<{ settings?: SiteSettings }>("/api/settings"),
  ]);

  const name = seo.organizationName || seo.siteName || "LinkNews24";
  const logo = seo.organizationLogo || site?.settings?.logoUrl || DEFAULT_SHARE_IMAGE;
  const sameAs = [
    ...new Set(
      (site?.settings?.socials ?? [])
        .map((s) => (s.url ? cleanProfileUrl(s.url) : null))
        .filter((u): u is string => !!u),
    ),
  ];

  const orgId = `${SITE_URL}/#organization`;

  const organization = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "@id": orgId,
    name,
    alternateName: ALTERNATE_NAMES,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: logo },
    ...(sameAs.length ? { sameAs } : {}),
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name,
    alternateName: ALTERNATE_NAMES,
    publisher: { "@id": orgId },
    inLanguage: "bn-BD",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(website) }}
      />
    </>
  );
}
