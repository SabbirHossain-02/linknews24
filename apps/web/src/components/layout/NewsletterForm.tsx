"use client";

import { useState } from "react";
import { API_BASE } from "@/lib/admin-api";
import { useLocale } from "@/components/providers/LocaleProvider";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { locale, t } = useLocale();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE}/api/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      /* ignore */
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <p className="mt-3 rounded border border-border bg-background px-3 py-2.5 font-ui text-sm text-foreground-muted">
        {locale === "bn"
          ? "ধন্যবাদ! আপনি সফলভাবে সাবস্ক্রাইব করেছেন।"
          : "Thank you! You've subscribed successfully."}
      </p>
    );
  }

  return (
    <form className="mt-3 flex gap-2" onSubmit={handleSubmit}>
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
