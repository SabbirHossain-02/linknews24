"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { categories } from "@/lib/mock-data";

export function MainNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-3">
        <Link
          href="/"
          className="shrink-0 text-xl font-bold tracking-tight text-brand-navy"
        >
          Link News<span className="text-brand-crimson">24</span>
        </Link>

        <ul className="hidden flex-1 flex-wrap items-center justify-end gap-x-6 gap-y-2 md:flex">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/${cat.slug}`}
                className="font-medium text-sm text-foreground/80 transition-colors hover:text-brand-crimson"
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>

        <button
          className="hidden shrink-0 text-foreground/70 transition-colors hover:text-brand-crimson md:block"
          aria-label="সার্চ"
        >
          <Search className="h-5 w-5" />
        </button>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="মেনু খুলুন"
          className="shrink-0 text-brand-navy md:hidden"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <div className={`${open ? "block" : "hidden"} border-t border-border md:hidden`}>
        <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-6 py-3">
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/${cat.slug}`}
                className="block py-1.5 font-medium text-sm text-foreground/80 transition-colors hover:text-brand-crimson"
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
