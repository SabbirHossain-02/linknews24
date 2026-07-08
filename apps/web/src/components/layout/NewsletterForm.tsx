"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <p className="mt-3 rounded border border-white/15 bg-white/5 px-3 py-2.5 font-ui text-sm text-white/70">
        ব্যাকএন্ড এখনো সংযুক্ত হয়নি — নিউজলেটার ফিচারটি শীঘ্রই চালু হবে।
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
        placeholder="ইমেইল ঠিকানা"
        className="w-full rounded border border-white/15 bg-white/5 px-3 py-2 font-ui text-sm text-white placeholder:text-white/40 focus:border-brand-crimson focus:outline-none"
      />
      <button
        type="submit"
        className="shrink-0 rounded bg-brand-crimson px-4 py-2 font-ui text-sm font-medium text-white transition-colors hover:bg-brand-crimson-dark"
      >
        সাবস্ক্রাইব
      </button>
    </form>
  );
}
