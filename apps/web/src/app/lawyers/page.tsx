"use client";

import Link from "next/link";
import { divisions, districts } from "@/lib/directory-data";
import { useLocale } from "@/components/providers/LocaleProvider";

export default function LawyersPage() {
  const { locale, t } = useLocale();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
      <h1 className="text-2xl font-bold text-heading sm:text-3xl">
        {t("lawyersTitle")}
      </h1>
      <p className="mt-1 font-ui text-sm text-foreground-muted">
        {t("lawyersSubtitle")}
      </p>

      <div className="mt-8 flex flex-col gap-8">
        {divisions.map((div) => (
          <section key={div.slug}>
            <h2 className="font-ui text-xs font-semibold uppercase tracking-wider text-foreground-muted/70">
              {locale === "en" ? div.nameEn : div.name}
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {districts
                .filter((d) => d.division === div.slug)
                .map((d) => (
                  <Link
                    key={d.slug}
                    href={`/lawyers/${d.slug}`}
                    className="rounded-lg border border-border bg-background px-3.5 py-2.5 font-ui text-sm font-medium text-foreground transition-colors hover:border-brand-crimson hover:text-brand-crimson"
                  >
                    {locale === "en" ? d.nameEn : d.name}
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
