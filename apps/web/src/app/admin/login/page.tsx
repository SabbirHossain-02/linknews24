"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      router.replace("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "লগইন ব্যর্থ হয়েছে");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-brand-navy px-4">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-background shadow-2xl">
        <div className="h-1 bg-gradient-to-r from-brand-crimson to-brand-crimson-dark" />
        <div className="px-7 pb-7 pt-8">
          <div className="text-center">
            <span className="text-2xl font-bold tracking-tight text-heading">
              Link News<span className="text-brand-crimson">24</span>
            </span>
            <p className="mt-1 font-ui text-sm text-foreground-muted">
              অ্যাডমিন প্যানেল — লগইন করুন
            </p>
          </div>

          {error && (
            <p className="mt-5 rounded-lg bg-brand-crimson/10 px-3.5 py-2 font-ui text-xs text-brand-crimson">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ইমেইল ঠিকানা"
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-3.5 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand-crimson focus:outline-none focus:ring-2 focus:ring-brand-crimson/15"
              />
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
              <input
                type={show ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="পাসওয়ার্ড"
                className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-foreground-muted focus:border-brand-crimson focus:outline-none focus:ring-2 focus:ring-brand-crimson/15"
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground"
                aria-label={show ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="mt-1 rounded-lg bg-brand-crimson py-2.5 font-ui text-sm font-semibold text-white transition-colors hover:bg-brand-crimson-dark disabled:opacity-60"
            >
              {busy ? "লগইন হচ্ছে…" : "লগইন করুন"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
