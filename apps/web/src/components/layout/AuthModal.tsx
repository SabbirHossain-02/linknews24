"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { GoogleIcon } from "@/components/icons/GoogleIcon";

type Mode = "login" | "register";

function GoogleButton({ label }: { label: string }) {
  const [notice, setNotice] = useState(false);

  if (notice) {
    return (
      <p className="rounded-lg bg-surface px-3.5 py-2.5 text-center font-ui text-xs text-foreground-muted">
        Google সাইন-ইন এখনো সংযুক্ত হয়নি — শীঘ্রই চালু হবে।
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setNotice(true)}
      className="flex items-center justify-center gap-2.5 rounded-lg border border-border py-2.5 font-ui text-sm font-medium text-foreground transition-colors hover:bg-surface"
    >
      <GoogleIcon className="h-4 w-4" />
      {label}
    </button>
  );
}

export function AuthModal({
  triggerClassName = "transition-colors hover:text-white",
  triggerLabel = "লগইন",
}: {
  triggerClassName?: string;
  triggerLabel?: string;
} = {}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [error, setError] = useState<string | null>(null);
  const { login, register } = useAuth();
  const router = useRouter();

  const close = () => {
    setOpen(false);
    setError(null);
    setMode("login");
  };

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    login(String(form.get("email")));
    close();
    router.push("/dashboard");
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));
    const confirmPassword = String(form.get("confirmPassword"));

    if (password !== confirmPassword) {
      setError("পাসওয়ার্ড দুটো মিলছে না।");
      return;
    }

    register(String(form.get("name")), String(form.get("email")));
    close();
    router.push("/dashboard");
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className={triggerClassName}>
        {triggerLabel}
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
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setMode("login");
                    setError(null);
                  }}
                  className={`text-lg font-bold transition-colors ${
                    mode === "login" ? "text-heading" : "text-foreground-muted"
                  }`}
                >
                  লগইন
                </button>
                <button
                  onClick={() => {
                    setMode("register");
                    setError(null);
                  }}
                  className={`text-lg font-bold transition-colors ${
                    mode === "register" ? "text-heading" : "text-foreground-muted"
                  }`}
                >
                  নতুন অ্যাকাউন্ট
                </button>
              </div>
              <button
                onClick={close}
                aria-label="বন্ধ করুন"
                className="text-foreground-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <p className="mt-4 rounded-lg bg-brand-crimson/10 px-3.5 py-2 font-ui text-xs text-brand-crimson">
                {error}
              </p>
            )}

            {mode === "login" ? (
              <form key="login" className="mt-5 flex flex-col gap-3" onSubmit={handleLogin}>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="ইমেইল ঠিকানা"
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand-crimson focus:outline-none"
                />
                <input
                  name="password"
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
                <div className="flex items-center gap-3 py-1 text-xs text-foreground-muted">
                  <div className="h-px flex-1 bg-border" />
                  অথবা
                  <div className="h-px flex-1 bg-border" />
                </div>
                <GoogleButton label="Google দিয়ে লগইন করুন" />
              </form>
            ) : (
              <form
                key="register"
                className="mt-5 flex flex-col gap-3"
                onSubmit={handleRegister}
              >
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="পূর্ণ নাম"
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand-crimson focus:outline-none"
                />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="ইমেইল ঠিকানা"
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand-crimson focus:outline-none"
                />
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="পাসওয়ার্ড"
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand-crimson focus:outline-none"
                />
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  placeholder="পাসওয়ার্ড নিশ্চিত করুন"
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand-crimson focus:outline-none"
                />
                <label className="flex items-start gap-2 font-ui text-xs text-foreground-muted">
                  <input
                    type="checkbox"
                    required
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-brand-crimson"
                  />
                  আমি রোবট নই এবং LinkNews24-এর শর্তাবলী ও গোপনীয়তা নীতিতে সম্মত।
                </label>
                <button
                  type="submit"
                  className="mt-1 rounded-lg bg-brand-crimson py-2.5 font-ui text-sm font-medium text-white transition-colors hover:bg-brand-crimson-dark"
                >
                  রেজিস্টার করুন
                </button>
                <div className="flex items-center gap-3 py-1 text-xs text-foreground-muted">
                  <div className="h-px flex-1 bg-border" />
                  অথবা
                  <div className="h-px flex-1 bg-border" />
                </div>
                <GoogleButton label="Google দিয়ে রেজিস্টার করুন" />
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
