"use client";

import Link from "next/link";
import { navItems } from "@/lib/mock-data";
import { localizedName } from "@/lib/i18n";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Category } from "@/types/content";
import { FacebookIcon, XIcon, YoutubeIcon } from "@/components/icons/SocialIcons";
import { NewsletterForm } from "./NewsletterForm";

const footerCategories: Category[] = navItems.flatMap((item) =>
  item.children
    ? item.children
    : [
        {
          id: item.label,
          name: item.label,
          nameEn: item.labelEn,
          slug: item.href!.slice(1),
        },
      ],
);

export function SiteFooter() {
  const { locale, t } = useLocale();

  const legalLinks = [
    { label: t("footerAbout"), href: "/about" },
    { label: t("footerContact"), href: "/contact" },
    { label: t("footerPrivacy"), href: "/privacy" },
    { label: t("footerTerms"), href: "/terms" },
  ];

  return (
    <footer className="border-t border-border bg-surface text-foreground-muted">
      <div className="mx-auto grid max-w-[1600px] gap-10 px-6 py-12 md:grid-cols-4">
        <div>
          <span className="text-xl font-bold tracking-tight text-heading">
            Link News<span className="text-brand-crimson">24</span>
          </span>
          <p className="mt-3 max-w-xs font-ui text-sm text-foreground-muted">
            {t("footerTagline")}
          </p>
          <div className="mt-4 flex gap-4">
            <a href="#" aria-label="Facebook" className="hover:text-brand-crimson">
              <FacebookIcon className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-brand-crimson">
              <XIcon className="h-5 w-5" />
            </a>
            <a href="#" aria-label="YouTube" className="hover:text-brand-crimson">
              <YoutubeIcon className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-ui text-xs font-semibold uppercase tracking-wider text-foreground-muted/70">
            {t("footerCategories")}
          </h3>
          <ul className="mt-3 grid grid-cols-2 gap-2 font-ui text-sm">
            {footerCategories.map((cat) => (
              <li key={cat.id}>
                <Link href={`/${cat.slug}`} className="hover:text-brand-crimson">
                  {localizedName(cat, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-ui text-xs font-semibold uppercase tracking-wider text-foreground-muted/70">
            {t("footerImportantLinks")}
          </h3>
          <ul className="mt-3 flex flex-col gap-2 font-ui text-sm">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-brand-crimson">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div id="newsletter">
          <h3 className="font-ui text-xs font-semibold uppercase tracking-wider text-foreground-muted/70">
            {t("footerNewsletter")}
          </h3>
          <p className="mt-3 font-ui text-sm text-foreground-muted">
            {t("footerNewsletterCopy")}
          </p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-border py-4 text-center font-ui text-xs text-foreground-muted/70">
        © {new Date().getFullYear()} LinkNews24. {t("footerRights")}
      </div>
    </footer>
  );
}
