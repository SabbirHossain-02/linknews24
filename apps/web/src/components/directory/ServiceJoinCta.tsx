"use client";

import Link from "next/link";
import { ArrowRight, Building2, Droplet, Scale } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { AuthModal } from "@/components/layout/AuthModal";
import type { TranslationKey } from "@/lib/i18n";

export type JoinService = "lawyer" | "donor" | "hospital";

const COPY: Record<
  JoinService,
  { icon: typeof Droplet; title: TranslationKey; body: TranslationKey }
> = {
  lawyer: {
    icon: Scale,
    title: "svcJoinLegalTitle",
    body: "svcJoinLegalCopy",
  },
  donor: {
    icon: Droplet,
    title: "svcJoinBloodTitle",
    body: "svcJoinBloodCopy",
  },
  hospital: {
    icon: Building2,
    title: "svcJoinHospitalTitle",
    body: "svcJoinHospitalCopy",
  },
};

const BUTTON =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-crimson px-5 py-2.5 font-ui text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-crimson-dark";

/**
 * "Join this service" — the way onto one of the three directories.
 *
 * A reader who wants to be listed had no route in from the page they were
 * already looking at: the intro told them to find the right tab in their
 * dashboard, which meant signing in first and then hunting for it. This puts
 * the whole path behind one button — sign in, and land on the form itself.
 *
 * Signed in, it is a plain link; signed out, the sign-in modal carries the
 * destination through so the visit ends where it was aimed rather than on the
 * dashboard's front page.
 */
export function ServiceJoinCta({ service }: { service: JoinService }) {
  const { user, ready } = useAuth();
  const { t } = useLocale();
  const { icon: Icon, title, body } = COPY[service];
  const href = `/dashboard?tab=${service}`;

  return (
    <section className="mt-6 flex flex-col gap-4 rounded-xl border border-brand-crimson/25 bg-gradient-to-r from-brand-crimson/[0.06] to-transparent p-5 sm:flex-row sm:items-center sm:gap-5">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-crimson/10 text-brand-crimson">
        <Icon className="h-6 w-6" />
      </span>

      <div className="min-w-0 flex-1">
        <h2 className="font-ui text-base font-bold text-heading">{t(title)}</h2>
        <p className="mt-1 font-ui text-sm leading-relaxed text-foreground-muted">
          {t(body)}
        </p>
      </div>

      <div className="flex flex-col items-start gap-1.5 sm:items-end">
        {/* Until the session is known, keep the button's shape but do nothing —
            guessing wrong would either flash a modal at a signed-in reader or
            send a signed-out one to a page that turns them away. */}
        {!ready ? (
          <span className={`${BUTTON} pointer-events-none opacity-60`}>
            {t("svcJoinButton")}
            <ArrowRight className="h-4 w-4" />
          </span>
        ) : user ? (
          <Link href={href} className={BUTTON}>
            {t("svcJoinButton")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <AuthModal
            redirectTo={href}
            triggerClassName={BUTTON}
            triggerChildren={
              <>
                {t("svcJoinButton")}
                <ArrowRight className="h-4 w-4" />
              </>
            }
          />
        )}
        <p className="font-ui text-[11px] text-foreground-muted">
          {ready && user ? t("svcJoinSignedInNote") : t("svcJoinSignedOutNote")}
        </p>
      </div>
    </section>
  );
}
