"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUp, Mail, MapPin, Phone } from "lucide-react";
import { navItems } from "@/lib/mock-data";
import { localizedName } from "@/lib/i18n";
import { API_BASE } from "@/lib/admin-api";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { Category } from "@/types/content";
import { FacebookIcon, XIcon, YoutubeIcon } from "@/components/icons/SocialIcons";
import { NewsletterForm } from "./NewsletterForm";
import { StoreBadges } from "./StoreBadges";

interface SiteConfig {
  tagline?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  address?: string;
  email?: string;
  phone?: string;
  editor?: string;
}

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
  const [cfg, setCfg] = useState<SiteConfig>({});

  useEffect(() => {
    fetch(`${API_BASE}/api/settings`)
      .then((r) => r.json())
      .then((d) => setCfg(d.settings ?? {}))
      .catch(() => {});
  }, []);

  const companyLinks = [
    { label: t("footerAbout"), href: "/about" },
    { label: t("footerContact"), href: "/contact" },
    { label: t("footerAdvertise"), href: "/advertise" },
    { label: t("footerCareers"), href: "/careers" },
    { label: t("footerFeedback"), href: "/feedback" },
    { label: t("epaper"), href: "/epaper" },
    { label: t("footerPrivacy"), href: "/privacy" },
    { label: t("footerTerms"), href: "/terms" },
  ];

  const scrollTop = () =>
    window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="border-t border-border bg-surface text-foreground-muted">
      <div className="mx-auto grid max-w-[1600px] gap-10 px-6 py-12 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand + social + app */}
        <div>
          <span className="text-xl font-bold tracking-tight text-heading">
            Link News<span className="text-brand-crimson">24</span>
          </span>
          <p className="mt-3 max-w-xs font-ui text-sm text-foreground-muted">
            {cfg.tagline || t("footerTagline")}
          </p>
          <div className="mt-4 flex gap-4">
            <a href={cfg.facebook || "#"} aria-label="Facebook" className="hover:text-brand-crimson">
              <FacebookIcon className="h-5 w-5" />
            </a>
            <a href={cfg.twitter || "#"} aria-label="Twitter" className="hover:text-brand-crimson">
              <XIcon className="h-5 w-5" />
            </a>
            <a href={cfg.youtube || "#"} aria-label="YouTube" className="hover:text-brand-crimson">
              <YoutubeIcon className="h-5 w-5" />
            </a>
          </div>

          <div className="mt-6">
            <h3 className="font-ui text-xs font-semibold uppercase tracking-wider text-foreground-muted/70">
              {t("footerApp")}
            </h3>
            <div className="mt-3">
              <StoreBadges soonLabel={t("footerAppSoon")} />
            </div>
          </div>
        </div>

        {/* Categories */}
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

        {/* Company links */}
        <div>
          <h3 className="font-ui text-xs font-semibold uppercase tracking-wider text-foreground-muted/70">
            {t("footerCompany")}
          </h3>
          <ul className="mt-3 grid grid-cols-2 gap-2 font-ui text-sm lg:grid-cols-1">
            {companyLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-brand-crimson">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter + contact */}
        <div id="newsletter">
          <h3 className="font-ui text-xs font-semibold uppercase tracking-wider text-foreground-muted/70">
            {t("footerNewsletter")}
          </h3>
          <p className="mt-3 font-ui text-sm text-foreground-muted">
            {t("footerNewsletterCopy")}
          </p>
          <NewsletterForm />

          <div className="mt-6 border-t border-border pt-5">
            <h3 className="font-ui text-xs font-semibold uppercase tracking-wider text-foreground-muted/70">
              {t("footerContactInfo")}
            </h3>
            <ul className="mt-3 flex flex-col gap-2.5 font-ui text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-crimson" />
                {cfg.address || t("footerAddress")}
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-brand-crimson" />
                <a
                  href={`mailto:${cfg.email || "info@linknews24.com"}`}
                  className="hover:text-brand-crimson"
                >
                  {cfg.email || "info@linknews24.com"}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-brand-crimson" />
                <a
                  href={`tel:${(cfg.phone || "+880 255-000000").replace(/\s/g, "")}`}
                  className="hover:text-brand-crimson"
                >
                  {cfg.phone || "+880 255-000000"}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center gap-2 px-6 py-4 text-center font-ui text-xs text-foreground-muted/70 sm:flex-row sm:justify-between sm:text-left">
          <span>{cfg.editor || t("footerEditor")}</span>
          <span>
            © {new Date().getFullYear()} LinkNews24. {t("footerRights")}
          </span>
          <button
            onClick={scrollTop}
            className="flex items-center gap-1 transition-colors hover:text-brand-crimson"
          >
            {t("backToTop")}
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
