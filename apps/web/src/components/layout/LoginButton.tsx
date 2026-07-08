"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function LoginButton() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const close = () => {
    setOpen(false);
    setSubmitted(false);
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="transition-colors hover:text-white">
        লগইন
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4"
          onClick={close}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-xl bg-background p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-heading">লগইন করুন</h2>
              <button
                onClick={close}
                aria-label="বন্ধ করুন"
                className="text-foreground-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitted ? (
              <p className="mt-5 rounded-lg bg-surface px-4 py-3 font-ui text-sm text-foreground-muted">
                ব্যাকএন্ড এখনো সংযুক্ত হয়নি — লগইন ফিচারটি শীঘ্রই চালু হবে।
              </p>
            ) : (
              <form
                className="mt-5 flex flex-col gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
              >
                <input
                  type="email"
                  required
                  placeholder="ইমেইল ঠিকানা"
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand-crimson focus:outline-none"
                />
                <input
                  type="password"
                  required
                  placeholder="পাসওয়ার্ড"
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand-crimson focus:outline-none"
                />
                <button
                  type="submit"
                  className="mt-1 rounded-lg bg-brand-crimson py-2.5 font-ui text-sm font-medium text-white transition-colors hover:bg-brand-crimson-dark"
                >
                  লগইন করুন
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
