"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, Building2, Droplet, Scale } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { AuthModal } from "@/components/layout/AuthModal";
import type { TranslationKey } from "@/lib/i18n";

export type JoinService = "lawyer" | "donor" | "hospital";

const COPY: Record<
  JoinService,
  {
    icon: typeof Droplet;
    title: TranslationKey;
    body: TranslationKey;
    warning: TranslationKey;
  }
> = {
  lawyer: {
    icon: Scale,
    title: "svcJoinLegalTitle",
    body: "svcJoinLegalCopy",
    warning: "svcWarnLegal",
  },
  donor: {
    icon: Droplet,
    title: "svcJoinBloodTitle",
    body: "svcJoinBloodCopy",
    warning: "svcWarnBlood",
  },
  hospital: {
    icon: Building2,
    title: "svcJoinHospitalTitle",
    body: "svcJoinHospitalCopy",
    warning: "svcWarnHospital",
  },
};

const BUTTON =
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-crimson px-5 py-2.5 font-ui text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-crimson-dark";

/**
 * "Join this service" — the way onto one of the three directories, and the
 * disclaimer that belongs beside it.
 *
 * A reader who wanted to be listed had no route in from the page they were
 * already looking at: the intro told them to find the right tab in their
 * dashboard, which meant signing in first and then hunting for it. This puts
 * the whole path behind one button — sign in, and land on the form itself.
 *
 * Signed in, it is a plain link; signed out, the sign-in modal carries the
 * destination through so the visit ends where it was aimed rather than on the
 * dashboard's front page.
 *
 * The warning underneath is the more important half. Every entry in these
 * directories is written by the person listed, not by the newsroom, and people
 * act on them in a hurry — phoning a stranger for blood, handing a case to an
 * advocate. It says plainly who checked what, and what to verify first. The
 * wording differs per service because the risk does.
 */
export function ServiceJoinCta({ service }: { service: JoinService }) {
  const { user, ready } = useAuth();
  const { t } = useLocale();
  const { icon: Icon, title, body, warning } = COPY[service];
  const href = `/dashboard?tab=${service}`;

  return (
    <section className="mt-6 rounded-xl border border-brand-crimson/25 bg-gradient-to-r from-brand-crimson/[0.06] to-transparent p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-crimson/10 text-brand-crimson">
          <Icon className="h-6 w-6" />
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="font-ui text-base font-bold text-heading">{t(title)}</h2>
          <p className="mt-1 font-ui text-sm leading-relaxed text-foreground-muted">
            {t(body)}
          </p>
        </div>

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
      </div>

      <div
        role="note"
        className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2.5"
      >
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <p className="font-ui text-xs leading-relaxed text-amber-900">
          <span className="font-bold">{t("svcWarnLabel")}: </span>
          {t(warning)}
        </p>
      </div>
    </section>
  );
}
