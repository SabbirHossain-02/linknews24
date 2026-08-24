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
        className="mx-auto flex max-w-[1600px] justify-center px-6 pt-6"
        imgClassName="max-h-[120px] w-auto object-contain"
      />
      <div className="mx-auto grid max-w-[1600px] gap-10 px-6 py-12 md:grid-cols-2 lg:grid-cols-4">
        {/* Brand + social + app. The masthead itself, not a text imitation of
            it — the same file the header and the editor use. */}
        {showBrand && (
          <div>
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
            {show("social") && (
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
            )}

            {show("app") && (
              <div className="mt-6">
                <h3 className="font-ui text-xs font-semibold uppercase tracking-wider text-foreground-muted/70">
                  {t("footerApp")}
                </h3>
                <div className="mt-3">
                  <StoreBadges soonLabel={t("footerAppSoon")} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Categories */}
        {show("categories") && (
        <div>
          <h3 className="font-ui text-xs font-semibold uppercase tracking-wider text-foreground-muted/70">
            {t("footerCategories")}
          </h3>
          <ul className="mt-3 grid grid-cols-2 gap-2 font-ui text-sm">
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
        )}

        {/* Newsletter + contact */}
        {showLast && (
        <div id="newsletter">
          {show("newsletter") && (
            <>
              <h3 className="font-ui text-xs font-semibold uppercase tracking-wider text-foreground-muted/70">
                {t("footerNewsletter")}
              </h3>
              <p className="mt-3 font-ui text-sm text-foreground-muted">
                {t("footerNewsletterCopy")}
              </p>
              <NewsletterForm />
            </>
          )}

          {show("contact") && (
          <div className={show("newsletter") ? "mt-6 border-t border-border pt-5" : ""}>
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
          )}
        </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-[1600px] flex-col items-center gap-2 px-6 py-4 text-center font-ui text-xs text-foreground-muted/70 sm:flex-row sm:justify-between sm:text-left">
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
