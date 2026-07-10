"use client";

import Link from "next/link";
import { Droplet } from "lucide-react";
import { bloodGroups } from "@/lib/directory-data";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function BloodPage() {
  const { t } = useLocale();

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8">
      <h1 className="text-2xl font-bold text-heading sm:text-3xl">
        {t("bloodTitle")}
      </h1>
      <p className="mt-1 font-ui text-sm text-foreground-muted">
        {t("bloodSubtitle")}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {bloodGroups.map((g) => (
          <Link
            key={g.slug}
            href={`/blood/${g.slug}`}
            className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-6 shadow-sm transition-colors hover:border-brand-crimson"
          >
            <Droplet
              className="h-6 w-6 text-brand-crimson"
              fill="currentColor"
            />
            <span className="text-3xl font-bold text-heading transition-colors group-hover:text-brand-crimson">
              {g.label}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
