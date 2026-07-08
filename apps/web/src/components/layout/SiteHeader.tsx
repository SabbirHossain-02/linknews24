import { TopUtilityBar } from "./TopUtilityBar";
import { BreakingNewsTicker } from "./BreakingNewsTicker";
import { MainNav } from "./MainNav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50">
      <TopUtilityBar />
      <BreakingNewsTicker />
      <MainNav />
    </header>
  );
}
