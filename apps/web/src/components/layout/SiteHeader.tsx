import { TopUtilityBar } from "./TopUtilityBar";
import { BreakingNewsTicker } from "./BreakingNewsTicker";
import { MainNav } from "./MainNav";

// The whole header — date/utility bar, breaking-news ticker and nav — stays
// pinned to the top while the page scrolls. Only the ad strip above it (added
// separately in layout) scrolls away.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 shadow-sm">
      <TopUtilityBar />
      <BreakingNewsTicker />
      <MainNav />
    </header>
  );
}
