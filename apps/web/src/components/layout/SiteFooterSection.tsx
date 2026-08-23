import { getCategories } from "@/lib/api";
import { footerCategories } from "@/lib/nav";
import { SiteFooter } from "./SiteFooter";

/**
 * Server wrapper that feeds the footer the categories the CMS currently holds.
 *
 * SiteFooter is a client component (locale, settings fetch), so the category
 * list is read here instead. RealtimeRefresh re-runs this on the API's
 * `content:changed` event, so a category deleted in the admin leaves the footer
 * straight away rather than lingering as a dead link.
 */
export async function SiteFooterSection() {
  const categories = await getCategories();
  return <SiteFooter categories={footerCategories(categories)} />;
}
