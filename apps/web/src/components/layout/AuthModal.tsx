"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Lock, Mail, User, X } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLocale } from "@/components/providers/LocaleProvider";
import { GoogleIcon } from "@/components/icons/GoogleIcon";

type Mode = "login" | "register";

const fieldClass =
  "w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-3.5 text-sm text-foreground placeholder:text-foreground-muted transition-colors focus:border-brand-crimson focus:outline-none focus:ring-2 focus:ring-brand-crimson/15";

function IconInput({
  icon: Icon,
  ...props
}: { icon: typeof Mail } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
      <input {...props} className={fieldClass} />
    </div>
  );
}

function PasswordInput(
  props: React.InputHTMLAttributes<HTMLInputElement>,
) {
  const [visible, setVisible] = useState(false);
  const { t } = useLocale();

  return (
    <div className="relative">
      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={`${fieldClass} pr-10`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t("hidePassword") : t("showPassword")}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted transition-colors hover:text-foreground"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

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

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
  };

  const [busy, setBusy] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await login(String(form.get("email")), String(form.get("password")));
      close();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("signInFailed"));
    } finally {
      setBusy(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password"));
    const confirmPassword = String(form.get("confirmPassword"));

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    setBusy(true);
    try {
      await register(String(form.get("name")), String(form.get("email")), password);
      close();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("signInFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className={triggerClassName}>
        {triggerLabel ?? t("login")}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          onClick={close}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm overflow-hidden rounded-2xl bg-background shadow-2xl"
          >
            {/* Brand accent + logo header */}
            <div className="h-1 bg-gradient-to-r from-brand-crimson to-brand-crimson-dark" />
            <div className="relative px-6 pb-5 pt-7 text-center">
              <button
                onClick={close}
                aria-label={t("close")}
                className="absolute right-4 top-4 text-foreground-muted transition-colors hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
              <Image
                src="/logo.png"
                alt="LinkNews24"
                width={169}
                height={54}
                className="mx-auto h-12 w-auto"
              />
              <p className="mt-3 font-ui text-sm text-foreground-muted">
                {mode === "login" ? t("loginSubtitle") : t("registerSubtitle")}
              </p>
            </div>

            <div className="px-6 pb-6">
              {/* Segmented tab switcher */}
              <div className="mb-5 flex rounded-lg bg-surface p-1">
                {(["login", "register"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => switchMode(m)}
                    className={`flex-1 rounded-md py-2 font-ui text-sm font-semibold transition-colors ${
                      mode === m
                        ? "bg-background text-brand-crimson shadow-sm"
                        : "text-foreground-muted hover:text-foreground"
                    }`}
                  >
                    {m === "login" ? t("login") : t("newAccount")}
                  </button>
                ))}
              </div>

              {error && (
                <p className="mb-4 rounded-lg bg-brand-crimson/10 px-3.5 py-2 font-ui text-xs text-brand-crimson">
                  {error}
                </p>
              )}

              {mode === "login" ? (
                <form key="login" className="flex flex-col gap-3" onSubmit={handleLogin}>
                  <IconInput
                    icon={Mail}
                    name="email"
                    type="email"
                    required
                    placeholder={t("emailPlaceholder")}
                  />
                  <PasswordInput
                    name="password"
                    required
                    placeholder={t("passwordPlaceholder")}
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    className="mt-1 rounded-lg bg-brand-crimson py-2.5 font-ui text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-crimson-dark disabled:opacity-60"
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
                  className="flex flex-col gap-3"
                  onSubmit={handleRegister}
                >
                  <IconInput
                    icon={User}
                    name="name"
                    type="text"
                    required
                    placeholder={t("namePlaceholder")}
                  />
                  <IconInput
                    icon={Mail}
                    name="email"
                    type="email"
                    required
                    placeholder={t("emailPlaceholder")}
                  />
                  <PasswordInput
                    name="password"
                    required
                    minLength={6}
                    placeholder={t("passwordPlaceholder")}
                  />
                  <PasswordInput
                    name="confirmPassword"
                    required
                    minLength={6}
                    placeholder={t("confirmPasswordPlaceholder")}
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
                    disabled={busy}
                    className="mt-1 rounded-lg bg-brand-crimson py-2.5 font-ui text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-crimson-dark disabled:opacity-60"
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
        </div>
      )}
    </>
  );
}
