"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { GoogleIcon } from "@/components/icons/GoogleIcon";

type Mode = "login" | "register";

function GoogleButton({ label }: { label: string }) {
  const [notice, setNotice] = useState(false);
  const { t } = useLocale();

  if (notice) {
    return (
      <p className="rounded-lg bg-surface px-3.5 py-2.5 text-center font-ui text-xs text-foreground-muted">
        {t("googleNotConnected")}
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
  triggerLabel,
}: {
  triggerClassName?: string;
  triggerLabel?: string;
} = {}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [error, setError] = useState<string | null>(null);
  const { login, register } = useAuth();
  const { t } = useLocale();
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
      setError(t("passwordMismatch"));
      return;
    }

    register(String(form.get("name")), String(form.get("email")));
    close();
    router.push("/dashboard");
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className={triggerClassName}>
        {triggerLabel ?? t("login")}
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
                  {t("login")}
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
                  {t("newAccount")}
                </button>
              </div>
              <button
                onClick={close}
                aria-label={t("close")}
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
                  placeholder={t("emailPlaceholder")}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand-crimson focus:outline-none"
                />
                <input
                  name="password"
                  type="password"
                  required
                  placeholder={t("passwordPlaceholder")}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand-crimson focus:outline-none"
                />
                <button
                  type="submit"
                  className="mt-1 rounded-lg bg-brand-crimson py-2.5 font-ui text-sm font-medium text-white transition-colors hover:bg-brand-crimson-dark"
                >
                  {t("signIn")}
                </button>
                <div className="flex items-center gap-3 py-1 text-xs text-foreground-muted">
                  <div className="h-px flex-1 bg-border" />
                  {t("or")}
                  <div className="h-px flex-1 bg-border" />
                </div>
                <GoogleButton label={t("googleSignIn")} />
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
                  placeholder={t("namePlaceholder")}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand-crimson focus:outline-none"
                />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder={t("emailPlaceholder")}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand-crimson focus:outline-none"
                />
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder={t("passwordPlaceholder")}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand-crimson focus:outline-none"
                />
                <input
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  placeholder={t("confirmPasswordPlaceholder")}
                  className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand-crimson focus:outline-none"
                />
                <label className="flex items-start gap-2 font-ui text-xs text-foreground-muted">
                  <input
                    type="checkbox"
                    required
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-brand-crimson"
                  />
                  {t("agreeTerms")}
                </label>
                <button
                  type="submit"
                  className="mt-1 rounded-lg bg-brand-crimson py-2.5 font-ui text-sm font-medium text-white transition-colors hover:bg-brand-crimson-dark"
                >
                  {t("register")}
                </button>
                <div className="flex items-center gap-3 py-1 text-xs text-foreground-muted">
                  <div className="h-px flex-1 bg-border" />
                  {t("or")}
                  <div className="h-px flex-1 bg-border" />
                </div>
                <GoogleButton label={t("googleSignUp")} />
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
