"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUp, Mail, MapPin, Phone } from "lucide-react";
import { API_BASE } from "@/lib/admin-api";
import { useLocale } from "@/components/providers/LocaleProvider";
import type { NavChild } from "@/lib/nav";
import { FacebookIcon, XIcon, YoutubeIcon } from "@/components/icons/SocialIcons";
import { NewsletterForm } from "./NewsletterForm";
import { AdSlot } from "@/components/ads/AdSlot";
import { StoreBadges } from "./StoreBadges";
import { footerShows, type FooterBlock } from "@/lib/footer-blocks";

interface SiteConfig {
  tagline?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  address?: string;
  email?: string;
  phone?: string;
  editor?: string;
  /** Which blocks the footer shows. Missing means shown — see FOOTER_BLOCKS. */
  footer?: Partial<Record<FooterBlock, boolean>>;
}

export function SiteFooter({ categories }: { categories: NavChild[] }) {
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

  // Anything not explicitly switched off is on, so a footer never empties
  // itself just because the settings have not been saved yet.
  const show = (block: FooterBlock) => footerShows(cfg.footer, block);

  // A column with nothing left in it should not leave a gap in the grid.
  const showBrand = show("tagline") || show("social") || show("app");
  const showLast = show("newsletter") || show("contact");

  return (
    <footer className="border-t border-border bg-surface text-foreground-muted">
      <AdSlot
        placement="FOOTER"
        className="mx-auto flex max-w-[1600px] justify-center px-4 pt-6 sm:px-6"
        imgClassName="max-h-[120px] w-auto object-contain"
      />
      {/* Three columns on a phone. Stacked in one they ran on for several
          screenfuls; the masthead and the newsletter still take the full width,
          because a third of a 430px screen holds neither a logo nor an email
          field. */}
      <div className="mx-auto grid max-w-[1600px] grid-cols-3 gap-x-4 gap-y-8 px-4 py-8 sm:gap-x-6 sm:px-6 md:gap-10 lg:grid-cols-4 lg:py-12">
        {/* Brand + social + app. The masthead itself, not a text imitation of
            it — the same file the header and the editor use. */}
        {showBrand && (
          <div className="col-span-3 lg:col-span-1">
            <Link href="/" aria-label={t("home")} className="inline-block">
              <Image
                src="/logo.png"
                alt="LinkNews24"
                width={2048}
                height={656}
                className="h-11 w-auto"
              />
            </Link>
            {show("tagline") && (
              <p className="mt-4 max-w-xs font-ui text-sm text-foreground-muted">
                {cfg.tagline || t("footerTagline")}
              </p>
            )}
            <div className="mt-4 grid grid-cols-2 items-start gap-4 lg:block">
            {show("social") && (
              <div className="flex gap-4 lg:mt-4">
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
            )}

            {show("app") && (
              <div className="lg:mt-6">
                <h3 className="font-ui text-xs font-semibold uppercase tracking-wider text-foreground-muted/70">
                  {t("footerApp")}
                </h3>
                <div className="mt-3">
                  <StoreBadges soonLabel={t("footerAppSoon")} />
                </div>
              </div>
            )}
            </div>
          </div>
        )}

        {/* Categories */}
        {show("categories") && (
        <div>
          <h3 className="font-ui text-xs font-semibold uppercase tracking-wider text-foreground-muted/70">
            {t("footerCategories")}
          </h3>
          <ul className="mt-3 grid grid-cols-1 gap-2 font-ui text-[13px] sm:grid-cols-2 sm:text-sm lg:grid-cols-2">
            {categories.map((cat) => (
              <li key={cat.key}>
                <Link href={cat.href} className="hover:text-brand-crimson">
                  {locale === "en" ? cat.labelEn : cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        )}

        {/* Company links */}
        {show("company") && (
        <div>
          <h3 className="font-ui text-xs font-semibold uppercase tracking-wider text-foreground-muted/70">
            {t("footerCompany")}
          </h3>
          <ul className="mt-3 grid grid-cols-1 gap-2 font-ui text-[13px] sm:grid-cols-2 sm:text-sm lg:grid-cols-1">
            {companyLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-brand-crimson">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        )}

        {/* Contact and newsletter. `contents` lets both take their own place
            in the grid on a phone, while on a wide screen the wrapper collapses
            back into a single column holding the two of them. */}
        {showLast && (
        <div className="contents lg:block">
          {show("contact") && (
          <div className="col-span-1 lg:col-auto">
            <h3 className="font-ui text-xs font-semibold uppercase tracking-wider text-foreground-muted/70">
              {t("footerContactInfo")}
            </h3>
            <ul className="mt-3 flex flex-col gap-2.5 font-ui text-[13px] [overflow-wrap:anywhere] sm:text-sm">
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
          )}

          {show("newsletter") && (
            <div
              id="newsletter"
              className={`col-span-3 lg:col-auto ${
                show("contact") ? "lg:mt-6 lg:border-t lg:border-border lg:pt-5" : ""
              }`}
            >
              <h3 className="font-ui text-xs font-semibold uppercase tracking-wider text-foreground-muted/70">
                {t("footerNewsletter")}
              </h3>
              <p className="mt-3 font-ui text-sm text-foreground-muted">
                {t("footerNewsletterCopy")}
              </p>
              <NewsletterForm />
            </div>
          )}
        </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center gap-2 px-4 py-4 text-center font-ui text-[11px] text-foreground-muted/70 sm:flex-row sm:justify-between sm:px-6 sm:text-left sm:text-xs">
          <span>{show("editor") ? cfg.editor || t("footerEditor") : ""}</span>
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
