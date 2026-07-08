"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { formatBengaliDate } from "@/lib/bengali-calendar";
import { useLocale } from "@/components/providers/LocaleProvider";
import { UserMenu } from "./UserMenu";
import { LanguageToggle } from "./LanguageToggle";
import { FontSizeControl } from "./FontSizeControl";

const now = new Date();
const bengaliDate = formatBengaliDate(now);

export function TopUtilityBar() {
  const { locale, t } = useLocale();

  const gregorianDate = now.toLocaleDateString(locale === "bn" ? "bn-BD" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="border-b border-white/10 bg-brand-navy-soft">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-x-4 gap-y-1 px-6 py-1.5 font-ui text-xs text-white/60">
        <span>
          {gregorianDate}
          {locale === "bn" && (
            <>
              <span className="text-white/30"> · </span>
              {bengaliDate}
            </>
          )}
        </span>
        <div className="flex items-center gap-4">
          <FontSizeControl />
          <LanguageToggle />
          <Link href="/epaper" className="transition-colors hover:text-white">
            {t("epaper")}
          </Link>
          <UserMenu />
          <a
            href="#newsletter"
            className="text-brand-crimson transition-colors hover:text-white"
          >
            {t("subscribe")}
          </a>
          <Link href="/search" aria-label={t("search")}>
            <Search className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
