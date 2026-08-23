import { getCategories } from "@/lib/api";
import { buildNav } from "@/lib/nav";
import { TopUtilityBar } from "./TopUtilityBar";
import { BreakingNewsTicker } from "./BreakingNewsTicker";
import { MainNav } from "./MainNav";

// The whole header — date/utility bar, breaking-news ticker and nav — stays
// pinned to the top while the page scrolls. Only the ad strip above it (added
// separately in layout) scrolls away.
//
// The nav is built here, on the server, from the categories the CMS holds right
// now. RealtimeRefresh re-runs this on the API's `content:changed` event, so
// adding or deleting a category in the admin updates the menu without a reload.
export async function SiteHeader() {
  const categories = await getCategories();

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      <TopUtilityBar />
      <BreakingNewsTicker />
      <MainNav items={buildNav(categories)} />
    </header>
  );
}
