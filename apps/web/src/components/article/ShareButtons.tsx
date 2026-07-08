"use client";

import { FacebookIcon, XIcon } from "@/components/icons/SocialIcons";
import { MessageCircle } from "lucide-react";
import { useLocale } from "@/components/providers/LocaleProvider";

export function ShareButtons({ title }: { title: string }) {
  const { locale, t } = useLocale();

  return (
    <div className="flex items-center gap-3">
      <span className="font-ui text-xs font-semibold uppercase tracking-wide text-foreground-muted">
        {t("shareThis")}
      </span>
      <div className="flex items-center gap-2">
        <a
          href="#"
          aria-label={locale === "bn" ? "ফেসবুকে শেয়ার করুন" : "Share on Facebook"}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-heading/5 text-heading transition-colors hover:bg-brand-navy hover:text-white"
        >
          <FacebookIcon className="h-4 w-4" />
        </a>
        <a
          href="#"
          aria-label={locale === "bn" ? "হোয়াটসঅ্যাপে শেয়ার করুন" : "Share on WhatsApp"}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-heading/5 text-heading transition-colors hover:bg-brand-navy hover:text-white"
        >
          <MessageCircle className="h-4 w-4" />
        </a>
        <a
          href="#"
          aria-label={
            locale === "bn" ? `${title} শেয়ার করুন X-এ` : `Share ${title} on X`
          }
          className="flex h-8 w-8 items-center justify-center rounded-full bg-heading/5 text-heading transition-colors hover:bg-brand-navy hover:text-white"
        >
          <XIcon className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
