"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { navItems } from "@/lib/mock-data";

export function MainNav() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDesktopDropdown, setOpenDesktopDropdown] = useState<
    string | null
  >(null);
  const [openMobileDropdowns, setOpenMobileDropdowns] = useState<Set<string>>(
    new Set(),
  );

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
          aria-label="সার্চ"
        >
          <Search className="h-5 w-5" />
        </Link>

        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="মেনু খুলুন"
          className="shrink-0 text-brand-navy md:hidden"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div className="relative hidden border-t border-border md:block">
        <ul className="mx-auto flex max-w-[1600px] items-center gap-x-6 overflow-x-auto px-6 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => (
            <li
              key={item.label}
              className="shrink-0"
              onMouseEnter={() =>
                item.children && setOpenDesktopDropdown(item.label)
              }
            >
              {item.children ? (
                <button
                  className="flex items-center gap-1 font-medium text-sm text-foreground/80 transition-colors hover:text-brand-crimson"
                  onClick={() =>
                    setOpenDesktopDropdown((current) =>
                      current === item.label ? null : item.label,
                    )
                  }
                  aria-expanded={openDesktopDropdown === item.label}
                >
                  {item.label}
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              ) : (
                <Link
                  href={item.href!}
                  className="font-medium text-sm text-foreground/80 transition-colors hover:text-brand-crimson"
                >
                  {item.label}
                </Link>
              )}

              {item.children && openDesktopDropdown === item.label && (
                <div className="absolute left-0 right-0 top-full border-t border-border bg-background shadow-md">
                  <ul className="mx-auto flex max-w-[1600px] flex-wrap gap-x-8 gap-y-2 px-6 py-4">
                    {item.children.map((child) => (
                      <li key={child.id}>
                        <Link
                          href={`/${child.slug}`}
                          onClick={() => setOpenDesktopDropdown(null)}
                          className="font-medium text-sm text-foreground/80 transition-colors hover:text-brand-crimson"
                        >
                          {child.name}
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
          {navItems.map((item) => (
            <li key={item.label}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleMobileDropdown(item.label)}
                    className="flex w-full items-center justify-between py-1.5 font-medium text-sm text-foreground/80"
                    aria-expanded={openMobileDropdowns.has(item.label)}
                  >
                    {item.label}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        openMobileDropdowns.has(item.label) ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {openMobileDropdowns.has(item.label) && (
                    <ul className="flex flex-col gap-1 border-l border-border pb-1 pl-4">
                      {item.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={`/${child.slug}`}
                            onClick={() => setMobileOpen(false)}
                            className="block py-1.5 font-medium text-sm text-foreground/70 transition-colors hover:text-brand-crimson"
                          >
                            {child.name}
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
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
