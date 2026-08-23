"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import type { NavEntry } from "@/lib/nav";
import { useLocale } from "@/components/providers/LocaleProvider";

export function MainNav({ items }: { items: NavEntry[] }) {
  const { locale, t } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDesktopDropdown, setOpenDesktopDropdown] = useState<
    string | null
  >(null);
  const [openMobileDropdowns, setOpenMobileDropdowns] = useState<Set<string>>(
    new Set(),
  );

  const navLabel = (item: { label: string; labelEn: string }) =>
    locale === "en" ? item.labelEn : item.label;

  const toggleMobileDropdown = (label: string) => {
    setOpenMobileDropdowns((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <nav
      className="border-b border-border bg-background"
      onMouseLeave={() => setOpenDesktopDropdown(null)}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-6 px-6 py-3">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/logo.png"
            alt="LinkNews24"
            width={169}
            height={54}
            priority
            className="h-14 w-auto"
          />
        </Link>

        <Link
          href="/search"
          className="hidden shrink-0 text-foreground/70 transition-colors hover:text-brand-crimson md:block"
          aria-label={t("search")}
        >
          <Search className="h-5 w-5" />
        </Link>

        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={t("openMenu")}
          className="shrink-0 text-heading md:hidden"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div className="relative hidden border-t border-border md:block">
        <ul className="mx-auto flex max-w-[1600px] items-center gap-x-6 overflow-x-auto px-6 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => (
            <li
              key={item.key}
              className="shrink-0"
              onMouseEnter={() =>
                item.children && setOpenDesktopDropdown(item.key)
              }
            >
              {item.children ? (
                <button
                  className="flex items-center gap-1 font-medium text-sm text-foreground/80 transition-colors hover:text-brand-crimson"
                  onClick={() =>
                    setOpenDesktopDropdown((current) =>
                      current === item.key ? null : item.key,
                    )
                  }
                  aria-expanded={openDesktopDropdown === item.key}
                >
                  {navLabel(item)}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              ) : (
                <Link
                  href={item.href!}
                  className="font-medium text-sm text-foreground/80 transition-colors hover:text-brand-crimson"
                >
                  {navLabel(item)}
                </Link>
              )}

              {item.children && openDesktopDropdown === item.key && (
                <div className="absolute left-0 right-0 top-full border-t border-border bg-background shadow-md">
                  <ul className="mx-auto flex max-w-[1600px] flex-wrap gap-x-8 gap-y-2 px-6 py-4">
                    {item.children.map((child) => (
                      <li key={child.key}>
                        <Link
                          href={child.href}
                          onClick={() => setOpenDesktopDropdown(null)}
                          className="font-medium text-sm text-foreground/80 transition-colors hover:text-brand-crimson"
                        >
                          {navLabel(child)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div
        className={`${mobileOpen ? "block" : "hidden"} border-t border-border md:hidden`}
      >
        <ul className="mx-auto flex max-w-[1600px] flex-col gap-1 px-6 py-3">
          {items.map((item) => (
            <li key={item.key}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleMobileDropdown(item.key)}
                    className="flex w-full items-center justify-between py-1.5 font-medium text-sm text-foreground/80"
                    aria-expanded={openMobileDropdowns.has(item.key)}
                  >
                    {navLabel(item)}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        openMobileDropdowns.has(item.key) ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openMobileDropdowns.has(item.key) && (
                    <ul className="flex flex-col gap-1 border-l border-border pb-1 pl-4">
                      {item.children.map((child) => (
                        <li key={child.key}>
                          <Link
                            href={child.href}
                            onClick={() => setMobileOpen(false)}
                            className="block py-1.5 font-medium text-sm text-foreground/70 transition-colors hover:text-brand-crimson"
                          >
                            {navLabel(child)}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  href={item.href!}
                  onClick={() => setMobileOpen(false)}
                  className="block py-1.5 font-medium text-sm text-foreground/80 transition-colors hover:text-brand-crimson"
                >
                  {navLabel(item)}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
