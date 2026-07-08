"use client";

import { useState } from "react";
import { useLocale } from "@/components/providers/LocaleProvider";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { locale, t } = useLocale();

  if (submitted) {
    return (
      <p className="mt-3 rounded border border-border bg-background px-3 py-2.5 font-ui text-sm text-foreground-muted">
        {locale === "bn"
          ? "ব্যাকএন্ড এখনো সংযুক্ত হয়নি — নিউজলেটার ফিচারটি শীঘ্রই চালু হবে।"
          : "Backend isn't connected yet — the newsletter feature will be enabled soon."}
      </p>
    );
  }

  return (
    <form
      className="mt-3 flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("footerEmailPlaceholder")}
        className="w-full rounded border border-border bg-background px-3 py-2 font-ui text-sm text-foreground placeholder:text-foreground-muted focus:border-brand-crimson focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 rounded bg-brand-crimson px-4 py-2 font-ui text-sm font-medium text-white transition-colors hover:bg-brand-crimson-dark"
      >
        {t("subscribe")}
      </button>
    </form>
  );
}
